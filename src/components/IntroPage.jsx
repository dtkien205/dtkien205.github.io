import React from "react";
import INTRO_SECTIONS from "../config/introSections";
import { Divider } from "./Divider";

export default function IntroPage({ repo }) {
  const s = INTRO_SECTIONS[repo];
  if (!s) return null;

  const Label = s.labelTag || "span";
  return (
    <div>
      {React.createElement(
        Label,
        {
          className:
            "mx-1 mb-2 font-semibold uppercase tracking-tight text-slate-600 dark:text-slate-600",
        },
        "Series",
      )}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{s.title}</h1>
      <p className="text-gray-700 text-base mx-1">{s.description}</p>
      <Divider />
    </div>
  );
}
