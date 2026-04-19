"use client";

import { useEffect, useState } from "react";

const LINES = [
  "Steaming potatoes...",
  "Boiling potatoes...",
  "Mashing potatoes...",
  "Frying potatoes...",
  "Cooking potatoes...",
];

export function LoadingScreen({ visible }: { visible: boolean }) {
  const [text, setText] = useState("");
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setText(LINES[Math.floor(Math.random() * LINES.length)]);
  }, []);

  useEffect(() => {
    if (!visible) {
      const sleep = setTimeout(() => {
        setExiting(true);
        const fade = setTimeout(() => setHidden(true), 700);
        return () => clearTimeout(fade);
      }, 1300);
      return () => clearTimeout(sleep);
    }
  }, [visible]);

  if (hidden) return null;

  return (
    <div className={`loading-screen${exiting ? " loading-screen--exit" : ""}`}>
      <p className="loading-shimmer-text">{text}</p>
    </div>
  );
}
