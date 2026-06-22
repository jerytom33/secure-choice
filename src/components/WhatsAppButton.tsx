'use client';

import React from 'react';

export default function WhatsAppButton() {
  const whatsappUrl = 'https://wa.me/8953824852?text=Hi%20Secure%20Choice,%20I%20would%20like%20to%20inquire%20about%20your%20insurance%20services.';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      aria-label="Contact on WhatsApp"
    >
      {/* Pulse effect */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30 group-hover:animate-none"></span>

      {/* SVG icon */}
      <svg
        className="h-8 w-8 relative z-10 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.117-2.887-6.981-1.862-1.865-4.343-2.891-6.984-2.892-5.445 0-9.87 4.42-9.874 9.867-.001 1.73.453 3.414 1.315 4.897L1.93 22.122l4.717-1.968zM17.15 14.39c-.294-.147-1.74-.858-2.008-.956-.269-.099-.465-.148-.659.148-.195.297-.756.957-.928 1.154-.171.197-.343.222-.638.074-.294-.148-1.243-.458-2.37-1.464-.877-.782-1.47-1.747-1.642-2.044-.171-.297-.018-.458.129-.606.133-.133.294-.345.442-.518.148-.173.197-.297.294-.494.099-.197.049-.37-.025-.518-.074-.148-.659-1.59-.904-2.18-.243-.582-.487-.5-.659-.51-.17-.008-.367-.01-.563-.01-.197 0-.518.074-.789.37-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.74-.71 1.985-1.396.244-.686.244-1.278.17-1.396-.074-.118-.27-.197-.565-.345z" />
      </svg>
    </a>
  );
}
