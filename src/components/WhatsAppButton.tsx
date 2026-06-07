const WHATSAPP_URL =
  "https://wa.me/558331421219?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Home3%20Tecnologia%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os.";

const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Entrar em contato pelo WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1ebe5d] hover:shadow-[0_10px_24px_rgba(37,211,102,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 md:bottom-6 md:right-6 md:h-12 md:w-12"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-6 w-6 md:h-7 md:w-7"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 3.5C9.1 3.5 3.5 9.1 3.5 16c0 2.22.6 4.38 1.73 6.27L3.5 28.5l6.39-1.68A12.42 12.42 0 0 0 16 28.5c6.9 0 12.5-5.6 12.5-12.5S22.9 3.5 16 3.5Zm0 22.88c-1.95 0-3.85-.54-5.52-1.55l-.4-.24-3.8 1 1.02-3.7-.27-.4A10.34 10.34 0 0 1 5.62 16C5.62 10.28 10.28 5.62 16 5.62c2.77 0 5.37 1.08 7.33 3.04A10.31 10.31 0 0 1 26.38 16c0 5.72-4.66 10.38-10.38 10.38Zm5.69-7.77c-.31-.16-1.84-.91-2.12-1.01-.29-.1-.5-.16-.7.15-.21.31-.8 1.01-.99 1.22-.18.21-.36.23-.67.08-.31-.16-1.31-.48-2.49-1.54-.92-.82-1.54-1.84-1.73-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.15-.7-1.68-.96-2.3-.25-.6-.51-.52-.7-.53h-.6c-.21 0-.55.08-.83.39-.29.31-1.09 1.06-1.09 2.59s1.12 3 1.27 3.21c.16.21 2.2 3.35 5.32 4.7.74.32 1.32.51 1.77.65.75.24 1.43.2 1.96.12.6-.09 1.84-.75 2.1-1.48.26-.72.26-1.35.18-1.48-.08-.13-.29-.2-.6-.36Z"
        />
      </svg>
      <span className="sr-only">WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
