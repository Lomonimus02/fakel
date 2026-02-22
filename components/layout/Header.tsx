"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Menu, X, Phone } from "lucide-react";
import { CallbackModal } from "./CallbackModal";
import { SearchBar, TelegramIcon, WhatsAppIcon } from "@/components/shared";
import type { SiteSettings } from "@/lib/settings-types";
import { formatPhoneForLink } from "@/lib/settings-types";

const navLinks = [
  { href: "/catalog", label: "Каталог" },
  { href: "/services", label: "Услуги" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

interface HeaderProps {
  settings: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  
  const phoneLink = formatPhoneForLink(settings.phone);

  const handleCallbackClick = () => {
    setIsCallbackModalOpen(true);
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/planteo.svg"
            alt="Плантео"
            className="h-14 w-auto shrink-0 -my-3"
          />
          <div className="flex flex-col justify-center">
            <span className="font-display text-2xl font-bold tracking-wider uppercase leading-none">
              Плантео
            </span>
            <span className="text-sm text-text-gray leading-none mt-1">
              Аренда спецтехники
            </span>
          </div>
        </Link>

        {/* Nav (Desktop) */}
        <nav className="hidden md:flex gap-8 font-medium text-sm uppercase tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contacts (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Phone */}
          <div className="text-right">
            <a
              href={`tel:${phoneLink}`}
              className="text-accent font-bold font-display text-xl xl:text-2xl tracking-wide hover:text-accent-hover transition-colors block"
            >
              {settings.phone}
            </a>
            <div className="text-xs text-green-400 flex items-center justify-end gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full status-live"></span>
              {settings.workingHours}
            </div>
          </div>
          
          {/* Messenger Icons */}
          <div className="flex items-center gap-2">
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Написать в WhatsApp"
              >
                <WhatsAppIcon size={22} />
              </a>
            )}
            {settings.telegramUrl && (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Написать в Telegram"
              >
                <TelegramIcon size={22} />
              </a>
            )}
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleCallbackClick}
            className="bg-accent hover:bg-accent-hover text-dark px-6 py-2.5 rounded font-bold uppercase text-sm transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40"
          >
            Заказать звонок
          </button>
          
          {/* Collapsible Search */}
          <div className="hidden lg:block">
            <Suspense fallback={<div className="w-10 h-10 bg-surface rounded-lg animate-pulse" />}>
              <SearchBar variant="collapsible" placeholder="Поиск техники..." className="w-80" />
            </Suspense>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark/95 backdrop-blur-md border-t border-white/10">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {/* Mobile Search */}
            <Suspense fallback={<div className="h-12 bg-surface rounded-lg animate-pulse" />}>
              <SearchBar 
                className="w-full" 
                placeholder="Поиск техники..." 
                onSearch={() => setIsMenuOpen(false)}
              />
            </Suspense>
            <hr className="border-white/10" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium uppercase tracking-wide hover:text-accent transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            <a
              href={`tel:${phoneLink}`}
              className="flex items-center gap-2 text-accent font-bold font-display text-xl"
            >
              <Phone size={20} />
              {settings.phone}
            </a>
            {/* Mobile Messenger Buttons */}
            <div className="flex gap-3">
              {settings.whatsappUrl && (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 bg-[#25D366] text-white rounded-lg flex items-center justify-center gap-2 font-bold"
                >
                  <WhatsAppIcon size={22} />
                  WhatsApp
                </a>
              )}
              {settings.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 bg-[#0088cc] text-white rounded-lg flex items-center justify-center gap-2 font-bold"
                >
                  <TelegramIcon size={22} />
                  Telegram
                </a>
              )}
            </div>
            <button
              onClick={() => {
                handleCallbackClick();
                setIsMenuOpen(false);
              }}
              className="bg-accent text-dark font-bold uppercase py-3 rounded-lg text-sm shadow-lg"
            >
              Заказать звонок
            </button>
          </nav>
        </div>
      )}

      {/* Callback Modal */}
      <CallbackModal 
        isOpen={isCallbackModalOpen} 
        onClose={() => setIsCallbackModalOpen(false)} 
      />
    </header>
  );
}
