// src/components/IntroHome.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Divider } from "./Divider";

export default function IntroHome({
  label = "Kido's Blog",
  title = "Welcome to my personal website!",
  description = "A personal blog focused on CTF write-ups, common web vulnerabilities, and self-built labs for practicing offensive and defensive techniques.",
}) {
  return (
    <section aria-labelledby="intro-home-heading" className="mx-auto">
      <span className="mx-1 mb-2 font-semibold uppercase tracking-tight text-slate-600 dark:text-slate-600">
        {label}
      </span>

      <h1
        id="intro-home-heading"
        className="text-5xl font-extrabold text-gray-900 mb-4"
      >
        {title}
      </h1>

      <p className="text-gray-700 text-base mx-1">{description}</p>

      {<Divider text="Explore categories" />}
    </section>
  );
}
