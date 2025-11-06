import React from "react";
import INTRO_SECTIONS from "../config/introSections";

export default function IntroPage({ repo }) {
  const s = INTRO_SECTIONS[repo];
  if (!s) return null;

  const Label = s.labelTag || "span";
  return (
    <div className="relative mb-12 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50 -z-10 rounded-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-10" />

      <div className="relative px-8 py-12">
        {React.createElement(
          Label,
          {
            className:
              "inline-block px-4 py-1.5 mb-4 font-semibold uppercase tracking-wide text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md",
          },
          "Series",
        )}

        <h1 className="text-5xl font-extrabold mb-6 text-blue-600">
          {s.title}
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
          {s.description}
        </p>

        {/* Decorative bottom line */}
        <div className="mt-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full w-24" />
      </div>
    </div>
  );
}
