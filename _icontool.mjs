// L2 Icon extractor: decrypt Ver121 UTX, parse UE2 (L2) package, export Texture PNGs, map item_id->icon.
// Key finding: this L2 package uses a MODIFIED compact index where the FIRST byte's continuation
// bit is 0x40 (value = low 6 bits) and subsequent bytes use 0x80 (value = low 7 bits). No sign bit.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const CLIENT_DIR = 'C:/Users/admin/Desktop/Projeto L2 Versus/Lineage2_Interlude_Client/systextures';
const UTX_FILES = ['Icon.utx', 'IconCustom.utx'];
const RAW_DIR = 'C:/Users/admin/Desktop/l2versus-site/_icons_raw';
const OUT_DIR = 'C:/Users/admin/Desktop/l2versus-site/public/l2icons';
const ITEM_XML_DIRS = [
  'C:/Users/admin/Desktop/L2jOne_Server/gameserver/data/xml/items',
  'C:/Users/admin/Desktop/L2jOne_Server/gameserver/data/xml/items h5',
];

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function decryptUtx(filePath) {
  const raw = fs.readFileSync(filePath);
  const fname = path.basename(filePath).toLowerCase();
  let key = 0;
  for (let i = 0; i < fname.length; i++) key = (key + fname.charCodeAt(i)) & 0xff;
  const out = Buffer.alloc(raw.length - 28);
  for (let i = 28; i < raw.length; i++) out[i - 28] = raw[i] ^ key;
  return { data: out, key };
}

class Reader {
  constructor(buf) { this.b = buf; this.p = 0; }
  seek(o) { this.p = o; }
  u8() { return this.b[this.p++]; }
  u16() { const v = this.b.readUInt16LE(this.p); this.p += 2; return v; }
  u32() { const v = this.b.readUInt32LE(this.p); this.p += 4; return v; }
  i32() { const v = this.b.readInt32LE(this.p); this.p += 4; return v; }
  f32() { const v = this.b.readFloatLE(this.p); this.p += 4; return v; }
  bytes(n) { const v = this.b.subarray(this.p, this.p + n); this.p += n; return v; }
  // modified L2 compact index (unsigned): first byte cont=0x40, val low6; next bytes cont=0x80, val low7
  mc() {
    let b0 = this.b[this.p++];
    let v = b0 & 0x3f;
    let more = b0 & 0x40;
    let sh = 6;
    while (more) {
      const x = this.b[this.p++];
      v |= (x & 0x7f) << sh;
      sh += 7;
      more = x & 0x80;
    }
    return v;
  }
  fstring() {
    const len = this.mc();
    if (len > 0) {
      const raw = this.b.subarray(this.p, this.p + len);
      this.p += len;
      let end = raw.length;
      while (end > 0 && raw[end - 1] === 0) end--;
      return raw.toString('latin1', 0, end);
    }
    return '';
  }
}

function parsePackage(data) {
  const r = new Reader(data);
  const tag = r.u32();
  if (tag !== 0x9e2a83c1) throw new Error('bad tag 0x' + tag.toString(16));
  const fileVersion = r.u16();
  const licenseeVersion = r.u16();
  r.u32();
  const nameCount = r.i32();
  const nameOffset = r.i32();
  const exportCount = r.i32();
  const exportOffset = r.i32();
  const importCount = r.i32();
  const importOffset = r.i32();

  r.seek(nameOffset);
  const names = [];
  for (let i = 0; i < nameCount; i++) { const nm = r.fstring(); r.u32(); names.push(nm); }

  r.seek(exportOffset);
  const exports = [];
  for (let i = 0; i < exportCount; i++) {
    const clazz = r.mc();
    const superIdx = r.mc();
    const group = r.i32();
    const objectName = r.mc();
    const objectFlags = r.u32();
    const serialSize = r.mc();
    let serialOffset = 0;
    if (serialSize > 0) serialOffset = r.mc();
    exports.push({ clazz, superIdx, group, objectName, objectFlags, serialSize, serialOffset });
  }

  const resolveName = (i) => (i >= 0 && i < names.length ? names[i] : '?' + i);
  return { data, names, exports, resolveName, fileVersion, licenseeVersion, nameOffset };
}

const PT_BYTE = 0x01, PT_INT = 0x02, PT_BOOL = 0x03, PT_FLOAT = 0x04,
      PT_OBJECT = 0x05, PT_STRUCT = 0x0a;

function readProperties(r, pkg) {
  const props = {};
  let guard = 0;
  while (guard++ < 64) {
    const nameIdx = r.mc();
    const pname = pkg.resolveName(nameIdx);
    if (pname === 'None') break;
    const info = r.u8();
    const type = info & 0x0f;
    const szTag = (info >> 4) & 0x07;
    const arrayFlag = info & 0x80;
    if (type === PT_STRUCT) r.mc();
    let size;
    if (szTag <= 4) size = [1, 2, 4, 12, 16][szTag];
    else if (szTag === 5) size = r.u8();
    else if (szTag === 6) size = r.u16();
    else size = r.u32();
    if (type === PT_BOOL) {
      props[pname] = arrayFlag ? 1 : 0;
      continue;
    }
    if (arrayFlag) r.mc(); // array element index (non-bool array properties)
    const start = r.p;
    let value = null;
    if (type === PT_BYTE && size === 1) value = r.u8();
    else if (type === PT_INT && size === 4) value = r.i32();
    else if (type === PT_FLOAT && size === 4) value = r.f32();
    else if (type === PT_OBJECT) value = r.mc();
    else r.bytes(size);
    const consumed = r.p - start;
    if (consumed < size) r.bytes(size - consumed);
    else if (consumed > size) r.p = start + size;
    if (props[pname] === undefined) props[pname] = value;
  }
  return props;
}

const FMT = { 0: 'P8', 3: 'DXT1', 5: 'RGBA8', 7: 'DXT3', 8: 'DXT5' };

function readMips(pkg, startPos, expectU, expectV) {
  const r = new Reader(pkg.data);
  r.seek(startPos);
  const mipCount = r.mc();
  if (mipCount < 1 || mipCount > 16) return null;
  const mips = [];
  for (let m = 0; m < mipCount; m++) {
    r.u32(); // widthOffsetPos
    const dataLen = r.mc();
    if (dataLen < 0 || r.p + dataLen > pkg.data.length) return null;
    const data = r.bytes(dataLen);
    const uSize = r.u32();
    const vSize = r.u32();
    r.u8(); r.u8(); // uBits, vBits
    mips.push({ data, uSize, vSize });
  }
  if (mips.length && expectU && (mips[0].uSize !== expectU || mips[0].vSize !== expectV)) return null;
  return mips;
}

function parseTexture(pkg, exp) {
  const r = new Reader(pkg.data);
  r.seek(exp.serialOffset);
  const props = readProperties(r, pkg);
  const format = props.Format != null ? props.Format : 0;
  const after = r.p;
  // Some L2 packages (licensee!=0) insert a u32 (TLazyArray skip) before the mip count; others don't.
  let mips = readMips(pkg, after + 4, props.USize, props.VSize);
  if (!mips) mips = readMips(pkg, after, props.USize, props.VSize);
  if (!mips) mips = [];
  return { props, format, mips };
}

function color565(c) {
  return [
    Math.round(((c >> 11) & 0x1f) * 255 / 31),
    Math.round(((c >> 5) & 0x3f) * 255 / 63),
    Math.round((c & 0x1f) * 255 / 31),
  ];
}

function decodeDXT(data, w, h, fmt) {
  const out = Buffer.alloc(w * h * 4);
  const bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2);
  let off = 0;
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let alpha = null;
      if (fmt === 'DXT3') {
        alpha = [];
        for (let i = 0; i < 8; i++) { const bb = data[off + i]; alpha.push((bb & 0x0f) * 17); alpha.push((bb >> 4) * 17); }
        off += 8;
      } else if (fmt === 'DXT5') {
        const a0 = data[off], a1 = data[off + 1];
        let bits = 0n;
        for (let i = 0; i < 6; i++) bits |= BigInt(data[off + 2 + i]) << BigInt(8 * i);
        const at = [a0, a1];
        if (a0 > a1) { for (let i = 1; i < 7; i++) at.push(Math.round(((7 - i) * a0 + i * a1) / 7)); }
        else { for (let i = 1; i < 5; i++) at.push(Math.round(((5 - i) * a0 + i * a1) / 5)); at.push(0); at.push(255); }
        alpha = [];
        for (let i = 0; i < 16; i++) alpha.push(at[Number((bits >> BigInt(3 * i)) & 7n)]);
        off += 8;
      }
      const c0 = data[off] | (data[off + 1] << 8);
      const c1 = data[off + 2] | (data[off + 3] << 8);
      const lut = data[off + 4] | (data[off + 5] << 8) | (data[off + 6] << 16) | (data[off + 7] << 24);
      off += 8;
      const rgb0 = color565(c0), rgb1 = color565(c1);
      const pal = [rgb0, rgb1, [0, 0, 0], [0, 0, 0]];
      const alphaPal = [255, 255, 255, 255];
      if (fmt === 'DXT1' && c0 <= c1) {
        pal[2] = [Math.round((rgb0[0] + rgb1[0]) / 2), Math.round((rgb0[1] + rgb1[1]) / 2), Math.round((rgb0[2] + rgb1[2]) / 2)];
        pal[3] = [0, 0, 0]; alphaPal[3] = 0;
      } else {
        pal[2] = [Math.round((2 * rgb0[0] + rgb1[0]) / 3), Math.round((2 * rgb0[1] + rgb1[1]) / 3), Math.round((2 * rgb0[2] + rgb1[2]) / 3)];
        pal[3] = [Math.round((rgb0[0] + 2 * rgb1[0]) / 3), Math.round((rgb0[1] + 2 * rgb1[1]) / 3), Math.round((rgb0[2] + 2 * rgb1[2]) / 3)];
      }
      for (let py = 0; py < 4; py++) for (let px = 0; px < 4; px++) {
        const pi = py * 4 + px;
        const sel = (lut >> (2 * pi)) & 3;
        const x = bx * 4 + px, y = by * 4 + py;
        if (x >= w || y >= h) continue;
        const o = (y * w + x) * 4;
        out[o] = pal[sel][0]; out[o + 1] = pal[sel][1]; out[o + 2] = pal[sel][2];
        let a = 255;
        if (fmt === 'DXT1') a = alphaPal[sel];
        else if (fmt === 'DXT3' || fmt === 'DXT5') a = alpha[pi];
        out[o + 3] = a;
      }
    }
  }
  return out;
}

function decodeRGBA8(data, w, h) {
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) { out[i*4]=data[i*4+2]; out[i*4+1]=data[i*4+1]; out[i*4+2]=data[i*4]; out[i*4+3]=data[i*4+3]; }
  return out;
}
function decodeP8(data, w, h, palette) {
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) { const c = palette[data[i]] || [0,0,0,255]; out[i*4]=c[0]; out[i*4+1]=c[1]; out[i*4+2]=c[2]; out[i*4+3]=c[3]; }
  return out;
}

const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return c ^ 0xffffffff; }
function writePNG(rgba, w, h) {
  const rowbytes = w * 4 + 1;
  const rawimg = Buffer.alloc(rowbytes * h);
  for (let y = 0; y < h; y++) { rawimg[y * rowbytes] = 0; rgba.copy(rawimg, y * rowbytes + 1, y * w * 4, (y + 1) * w * 4); }
  const idat = zlib.deflateSync(rawimg);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunk = (type, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const body = Buffer.concat([Buffer.from(type, 'latin1'), d]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0); return Buffer.concat([len, body, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// palette resolver for P8 (Palette export references)
function getPalette(pkg, ref) {
  if (ref <= 0 || ref > pkg.exports.length) return null;
  const pe = pkg.exports[ref - 1];
  if (!pe || pe.serialSize <= 0) return null;
  const r = new Reader(pkg.data);
  r.seek(pe.serialOffset);
  readProperties(r, pkg);
  const count = r.mc();
  if (count <= 0 || count > 256) return null;
  const pal = [];
  for (let i = 0; i < count; i++) pal.push([r.u8(), r.u8(), r.u8(), r.u8()]);
  return pal;
}

const formatsSeen = new Set();
const extractedNames = new Set();
let extractedCount = 0;
const failures = [];

for (const file of UTX_FILES) {
  const fullPath = path.join(CLIENT_DIR, file);
  if (!fs.existsSync(fullPath)) { failures.push('missing ' + file); continue; }
  const { data, key } = decryptUtx(fullPath);
  let pkg;
  try { pkg = parsePackage(data); }
  catch (e) { failures.push(`${file}: header ${e.message}`); continue; }
  console.log(`[${file}] key=0x${key.toString(16)} names=${pkg.names.length} exports=${pkg.exports.length} ver=${pkg.fileVersion}/${pkg.licenseeVersion}`);

  let fileCount = 0, sizeMismatch = 0;
  for (const e of pkg.exports) {
    if (e.serialSize <= 0 || e.serialOffset <= 0) continue;
    const name = pkg.resolveName(e.objectName).toLowerCase();
    let tex;
    try { tex = parseTexture(pkg, e); } catch (err) { continue; }
    const mip = tex.mips[0];
    if (!mip || !mip.uSize || !mip.vSize) continue;
    const fmtName = FMT[tex.format];
    if (!fmtName) { failures.push(`${file}:${name}: unknown format ${tex.format}`); continue; }
    const w = mip.uSize, h = mip.vSize;
    if (w > 512 || h > 512 || (w & (w - 1)) !== 0 || (h & (h - 1)) !== 0) continue;
    let rgba;
    try {
      if (fmtName === 'DXT1' || fmtName === 'DXT3' || fmtName === 'DXT5') rgba = decodeDXT(mip.data, w, h, fmtName);
      else if (fmtName === 'RGBA8') rgba = decodeRGBA8(mip.data, w, h);
      else if (fmtName === 'P8') {
        const pal = tex.props.Palette != null ? getPalette(pkg, tex.props.Palette) : null;
        if (!pal) { failures.push(`${file}:${name}: P8 no palette`); continue; }
        rgba = decodeP8(mip.data, w, h, pal);
      }
    } catch (err) { failures.push(`${file}:${name}: decode ${fmtName} ${err.message}`); continue; }
    if (!rgba) continue;
    formatsSeen.add(fmtName);
    fs.writeFileSync(path.join(RAW_DIR, name + '.png'), writePNG(rgba, w, h));
    extractedNames.add(name);
    extractedCount++; fileCount++;
  }
  console.log(`  extracted ${fileCount} textures from ${file}`);
}
console.log('Formats seen:', [...formatsSeen].join(','), '| total icons:', extractedCount);

// item_id -> icon name
const itemMap = {};
function parseXmlDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) continue;
    if (!f.toLowerCase().endsWith('.xml')) continue;
    const txt = fs.readFileSync(full, 'latin1');
    const itemRe = /<item\s+id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
    for (const m of txt.matchAll(itemRe)) {
      const id = parseInt(m[1], 10);
      const iconM = m[2].match(/name="icon"\s+val="([^"]+)"/);
      if (iconM) {
        let icon = iconM[1].trim().toLowerCase();
        if (icon.startsWith('icon.')) icon = icon.slice(5);
        if (!(id in itemMap)) itemMap[id] = icon;
      }
    }
  }
}
for (const d of ITEM_XML_DIRS) parseXmlDir(d);
const itemIds = Object.keys(itemMap);
console.log('Items parsed:', itemIds.length);

let mapped = 0;
const missing = new Set();
for (const id of itemIds) {
  const src = path.join(RAW_DIR, itemMap[id] + '.png');
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(OUT_DIR, id + '.png')); mapped++; }
  else missing.add(itemMap[id]);
}
console.log('Items mapped to PNG:', mapped, '| distinct missing icons:', missing.size);

const sampleIds = ['57', '1538', '728', '1', '2', '3'];
const sampleFiles = [];
for (const id of sampleIds) { const p = path.join(OUT_DIR, id + '.png'); if (fs.existsSync(p)) sampleFiles.push(p); }

function checkPNG(p) { const b = fs.readFileSync(p); return { sigOk: b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71, w: b.readUInt32BE(16), h: b.readUInt32BE(20), size: b.length }; }
console.log('--- VERIFY sample PNGs ---');
for (const p of sampleFiles) console.log(path.basename(p), JSON.stringify(checkPNG(p)));

const summary = {
  iconsExtracted: extractedCount, itemsParsed: itemIds.length, itemsMapped: mapped,
  formatsSeen: [...formatsSeen], sampleFiles,
  missingIconSample: [...missing].slice(0, 20), failuresCount: failures.length, failuresSample: failures.slice(0, 20),
};
fs.writeFileSync('C:/Users/admin/Desktop/l2versus-site/_icon_summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
