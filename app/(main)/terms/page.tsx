import type { Metadata } from "next";
import { FileText, CreditCard, Clock, Download } from "lucide-react";
import { getSiteSettings } from "@/lib/get-settings";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Условия аренды",
  description:
    "Условия аренды спецтехники: документооборот, оплата с НДС 22%, минимальная смена 7+1. Работаем по договору с полным пакетом документов.",
};

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-5xl font-bold uppercase mb-8">
          Условия аренды
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-surface p-8 rounded-xl border border-white/5 hover:border-accent/50 transition duration-300">
            <FileText className="text-accent mb-4" size={40} />
            <h3 className="text-xl font-bold uppercase mb-2">Документооборот</h3>
            <p className="text-text-gray">
              Работаем по договору. Предоставляем полный пакет закрывающих
              документов (УПД, путевые листы, справки ЭСМ-7). Электронный
              документооборот (ЭДО) через Диадок.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-xl border border-white/5 hover:border-accent/50 transition duration-300">
            <CreditCard className="text-accent mb-4" size={40} />
            <h3 className="text-xl font-bold uppercase mb-2">Оплата</h3>
            <p className="text-text-gray">
              Работаем с НДС 22% и без НДС. Возможна постоплата для постоянных
              клиентов. Принимаем наличные и безналичные платежи.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-xl border border-white/5 hover:border-accent/50 transition duration-300">
            <Clock className="text-accent mb-4" size={40} />
            <h3 className="text-xl font-bold uppercase mb-2">
              Минимальная смена
            </h3>
            <p className="text-text-gray">
              Стандартная смена: 7 часов работы + 1 час подачи (7+1). Возможен
              заказ на полсмены (3+1) по повышенному тарифу в пределах района
              базирования.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-accent text-dark p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 btn-industrial">
          <div>
            <h3 className="text-2xl font-bold uppercase font-display">
              Нужен договор сейчас?
            </h3>
            <p className="font-medium">
              Скачайте шаблон договора или запросите реквизиты.
            </p>
          </div>
          <div className="flex gap-4">
            {settings.contractUrl ? (
              <a
                href={settings.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-dark text-white hover:bg-white hover:text-dark px-6 py-3 rounded font-bold uppercase transition inline-flex items-center gap-2"
              >
                <Download size={18} />
                Скачать PDF
              </a>
            ) : (
              <button
                disabled
                className="bg-dark/50 text-white/50 px-6 py-3 rounded font-bold uppercase cursor-not-allowed"
              >
                Скачать PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
