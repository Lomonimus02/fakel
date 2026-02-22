import { TelegramIcon } from "@/components/shared/TelegramIcon";
import { LeadForm } from "@/components/shared";
import { getSiteSettings } from "@/lib/get-settings";

export async function LeadFormSection() {
  const settings = await getSiteSettings();
  
  return (
    <section className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        <div className="bg-surface border border-white/10 rounded-xl p-8 md:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 px-3 py-1 rounded-full text-xs font-bold text-accent uppercase mb-4">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              Срочно
            </div>
            <h2 className="font-display text-4xl font-bold uppercase mb-4">
              Горит объект?
            </h2>
            <p className="text-text-gray mb-6">
              Оставьте номер — диспетчер перезвонит <span className="text-accent font-medium">через 3 минуты</span>,
              согласует цену и отправит технику.
            </p>
            {settings.telegramUrl && (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] text-xl group-hover:bg-[#0088cc]/20 transition-colors">
                  <TelegramIcon size={24} />
                </div>
                <div className="text-sm">
                  <div className="font-bold group-hover:text-[#0088cc] transition-colors">
                    Пишите в Telegram
                  </div>
                  <div className="text-text-gray">Отвечаем мгновенно</div>
                </div>
              </a>
            )}
          </div>

          {/* Form */}
          <div className="w-full md:w-1/2">
            <LeadForm
              source="Блок Горит объект"
              mode="emergency"
              buttonText="ЖДУ ЗВОНКА ДИСПЕТЧЕРА"
              showMessage={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
