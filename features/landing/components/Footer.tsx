import { footerContent } from '@/features/landing/data/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-secondary-400 py-[48px]">
      <div className="max-w-[1200px] mx-auto px-[24px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-[32px]">
          {/* Brand */}
          <div className="flex items-center gap-[10px]">
            <span className="material-symbols-outlined text-primary-400 text-[28px]">
              auto_stories
            </span>
            <div>
              <span className="text-[20px] font-bold text-white">{footerContent.brand}</span>
              <p className="text-[12px] text-secondary-500 mt-[2px]">{footerContent.tagline}</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-[20px]">
            <a
              href={footerContent.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram text-[24px]" />
            </a>
            <a
              href={footerContent.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <i className="fa-brands fa-tiktok text-[24px]" />
            </a>
            <a
              href={footerContent.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-[24px]" />
            </a>
            <a
              href={footerContent.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube text-[24px]" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-left mt-[24px] pt-[24px] border-t border-secondary-800">
          <p className="text-[13px]">
            &copy; {year} {footerContent.brand}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
