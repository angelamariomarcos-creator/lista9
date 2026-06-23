"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SeniorRexReactionProps = {
  trigger: number;
  type: "yes" | "no";
};

export default function SeniorRexReaction({ trigger, type }: SeniorRexReactionProps) {
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);

    // Cuando tengas los archivos de sonido grabados, descomenta esto:
    // (guarda tus audios como public/rex-si.mp3 y public/rex-no.mp3)
    //
    // const audioSrc = type === "yes" ? "/rex-si.mp3" : "/rex-no.mp3";
    // const audio = new Audio(audioSrc);
    // audioRef.current = audio;
    // audio.play().catch(() => {
    //   // Algunos navegadores bloquean el autoplay de audio,
    //   // esto evita que rompa la app si el sonido no puede sonar.
    // });

    const timeout = setTimeout(() => setVisible(false), 1300);
    return () => clearTimeout(timeout);
  }, [trigger, type]);

  const src = type === "yes" ? "/rex-yes.png" : "/rex-no.png";

  const imgStyle = {
    height: "16rem",
    width: "auto",
    objectFit: "contain" as const,
    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <AnimatePresence>
        {visible && type === "yes" && (
          <motion.img
            key="rex-yes"
            src={src}
            alt="Senior Rex aprueba"
            initial={{ scale: 0.3, rotate: -10, opacity: 0, y: 40 }}
            animate={{
              scale: [0.3, 1.15, 0.95, 1],
              rotate: [-10, 5, -3, 0],
              opacity: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={imgStyle}
          />
        )}
        {visible && type === "no" && (
          <motion.img
            key="rex-no"
            src={src}
            alt="Senior Rex no aprueba"
            initial={{ x: 0, scale: 0.3, opacity: 0, y: 40 }}
            animate={{
              x: [0, 0, -10, 10, -6, 6, 0],
              scale: [0.3, 1.1, 1, 1, 1, 1, 1],
              opacity: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={imgStyle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}