import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex justify-between items-center py-10 text-gray-600 text-sm">
          <div className="font-extrabold text-xl text-blue-700">Kido</div>
          <nav className="hidden sm:flex items-center gap-4">
            <a href="https://facebook.com/kido.kien07" target="_blank" rel="noreferrer" aria-label="Facebook" className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white ring-1 ring-gray-200 text-gray-600 hover:text-blue-600 hover:ring-blue-500 shadow-sm hover:shadow transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22 12.06C22 6.49 17.52 2 11.94 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94Z" />
              </svg>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">Facebook</span>
            </a>
            <a href="https://github.com/dtkien205" target="_blank" rel="noreferrer" aria-label="GitHub" className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white ring-1 ring-gray-200 text-gray-600 hover:text-gray-900 hover:ring-gray-900 shadow-sm hover:shadow transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05a9.2 9.2 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.93.68 1.87 0 1.35-.01 2.44-.01 2.77 0 .26.18.57.69.47A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" clipRule="evenodd" />
              </svg>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">GitHub</span>
            </a>
            <a href="https://instagram.com/_kido.07" target="_blank" rel="noreferrer" aria-label="Instagram" className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white ring-1 ring-gray-200 text-gray-600 hover:text-pink-600 hover:ring-pink-600 shadow-sm hover:shadow transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
              </svg>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">Instagram</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}


