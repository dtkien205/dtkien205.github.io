import React from "react";

export default function PageLoader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
      <p className="mt-4 text-slate-600">{text}</p>
    </div>
  );
}
