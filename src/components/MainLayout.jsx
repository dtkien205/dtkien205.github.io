import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
