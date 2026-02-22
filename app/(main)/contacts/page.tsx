import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";
import { LeadForm, TelegramIcon, YandexMapWidget } from "@/components/shared";
import { getSiteSettings, formatPhoneForLink } from "@/lib/get-settings";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Контакты | Planteo — Аренда спецтехники СПб",
  description:
    "Свяжитесь с Planteo для аренды спецтехники. Адрес: Санкт-Петербург, ул. Строителей 15. Телефон: +7 (812) 999-00-00. Работаем 24/7.",
};

export default async function ContactsPage() {
  const settings = await getSiteSettings();
  const phoneLink = formatPhoneForLink(settings.phone);

  return (
    <main className="pt-24 pb-20">
      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-4">
            Контакты
          </h1>
          <p className="text-text-gray text-lg max-w-xl">
            Свяжитесь с нами любым удобным способом — ответим в течение 5 минут
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* Phone - главный элемент */}
              <div className="bg-surface border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="text-accent" size={24} />
                  </div>
                  <div>
                    <h2 className="text-sm uppercase tracking-wide text-text-gray mb-2">
                      Телефон
                    </h2>
                    <a
                      href={`tel:${phoneLink}`}
                      className="font-display text-2xl md:text-3xl font-bold text-accent hover:text-accent-hover transition-colors"
                    >
                      {settings.phone}
                    </a>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-green-400 text-sm">
                        {settings.workingHours}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telegram */}
              {settings.telegramUrl && (
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0088cc]/10 rounded-lg flex items-center justify-center shrink-0">
                      <TelegramIcon className="text-[#0088cc]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-sm uppercase tracking-wide text-text-gray mb-2">
                        Telegram
                      </h2>
                      <a
                        href={settings.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium hover:text-[#0088cc] transition-colors"
                      >
                        Написать в Telegram
                      </a>
                      <p className="text-text-gray text-sm mt-1">
                        Отвечаем мгновенно
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address & Email Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Address */}
                <div className="bg-surface border border-white/10 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="text-text-gray" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xs uppercase tracking-wide text-text-gray mb-1">
                        Адрес
                      </h2>
                      <p className="text-sm font-medium leading-snug">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-surface border border-white/10 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="text-text-gray" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xs uppercase tracking-wide text-text-gray mb-1">
                        Email
                      </h2>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-sm font-medium hover:text-accent transition-colors"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requisites */}
              <div className="bg-surface border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="text-text-gray" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs uppercase tracking-wide text-text-gray mb-2">
                      Реквизиты
                    </h2>
                    <div className="text-sm text-text-gray space-y-0.5">
                      <p className="text-white/80 font-medium">ООО «Плантео»</p>
                      <p>ИНН: 7805777882 • ОГРН: 1217800054592</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Form */}
            <div>
              <h2 className="font-display text-xl font-bold uppercase mb-4">
                Быстрая связь с диспетчером
              </h2>
              <div className="bg-surface p-6 rounded-xl border border-white/10">
                <p className="text-text-gray mb-4">Оставьте номер — перезвоним через 5 минут</p>
                <LeadForm
                  source="Страница Контакты"
                  buttonText="Жду звонка"
                  showName={false}
                  showInterest={false}
                  showTaskType={false}
                  showEmail={false}
                  showMessage={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section>
        <YandexMapWidget
          address={settings.address}
          mapIframe={settings.mapIframe}
        />
      </section>
    </main>
  );
}
