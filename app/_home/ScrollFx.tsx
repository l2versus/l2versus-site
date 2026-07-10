"use client";

import { useEffect } from "react";

/** Ativa reveals no scroll: observa .sfx e adiciona .in ao entrar na viewport. */
export default function ScrollFx() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".sfx").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
