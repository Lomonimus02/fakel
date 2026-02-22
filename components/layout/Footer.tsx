import Link from "next/link";
import { Phone } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/shared";
import type { SiteSettings } from "@/lib/settings-types";
import { formatPhoneForLink } from "@/lib/settings-types";

const clientLinks = [
  { href: "/terms", label: "Условия" },
  { href: "/contacts", label: "Контакты" },
];

interface FooterProps {
  settings: SiteSettings;
  catalogLinks?: { href: string; label: string }[];
}

export function Footer({ settings, catalogLinks = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const phoneLink = formatPhoneForLink(settings.phone);

  return (
    <>
      <footer className="bg-surface border-t border-white/5 pt-16 pb-32 md:pb-16">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/planteo.svg" alt="Плантео" className="w-10 h-10" />
              <span className="font-display font-bold text-2xl uppercase">Плантео</span>
            </Link>
            <p className="text-text-gray text-sm">
              Planteo — профессиональная аренда спецтехники в Санкт-Петербурге и
              Ленинградской области.
            </p>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-bold uppercase mb-4 text-sm">Каталог</h4>
            <ul className="space-y-2 text-sm text-text-gray">
              {catalogLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clients */}
          <div>
            <h4 className="font-bold uppercase mb-4 text-sm">Клиентам</h4>
            <ul className="space-y-2 text-sm text-text-gray">
              {clientLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-bold uppercase mb-4 text-sm">Контакты</h4>
            <a
              href={`tel:${phoneLink}`}
              className="text-xl font-display font-bold mb-2 block hover:text-accent transition-colors"
            >
              {settings.phone}
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="text-sm text-text-gray hover:text-accent transition-colors block"
            >
              {settings.email}
            </a>
            <address className="text-sm text-text-gray mt-2 not-italic">
              {settings.address}
            </address>
            
            {/* Реквизиты */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 leading-relaxed">
                ООО «Плантео»<br />
                ИНН: 7805777882<br />
                ОГРН: 1217800054592
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-4 text-center border-t border-white/5 pt-8 text-xs text-gray-600">
          <p>© {currentYear} Planteo. Все права защищены.</p>
          <p className="mt-2 text-gray-500">ООО «Плантео» | ИНН: 7805777882 | ОГРН: 1217800054592</p>
        </div>
      </footer>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-dark/95 backdrop-blur border-t border-white/10 p-4 z-50 flex gap-3">
        <a
          href={`tel:${phoneLink}`}
          className="flex-1 bg-accent text-dark font-bold py-3 rounded flex items-center justify-center gap-2"
        >
          <Phone size={18} />
          Позвонить
        </a>
        {settings.whatsappUrl && (
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-12 bg-[#25D366] text-white font-bold rounded flex items-center justify-center shrink-0"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon size={22} />
          </a>
        )}
        {settings.telegramUrl && (
          <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-12 bg-[#0088cc] text-white font-bold rounded flex items-center justify-center shrink-0"
            aria-label="Telegram"
          >
            <TelegramIcon size={22} />
          </a>
        )}
      </div>
    </>
  );
}
