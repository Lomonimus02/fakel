import { Metadata } from "next";
import { Building2, Users, TrendingUp, Award } from "lucide-react";
import { getCompanySettings, getActiveDocuments } from "@/lib/actions/company";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "О компании Planteo | Аренда спецтехники в СПб",
  description:
    "Planteo — надёжный партнёр в аренде спецтехники. 5 лет на рынке, работа с НДС 22%. Санкт-Петербург.",
};

const stats = [
  {
    icon: Building2,
    value: "98%",
    label: "заказов в срок",
    description: "Точность исполнения",
  },
  {
    icon: Users,
    value: "500+",
    label: "довольных клиентов",
    description: "За всё время работы",
  },
  {
    icon: TrendingUp,
    value: "5",
    label: "лет на рынке",
    description: "Опыт и надёжность",
  },
  {
    icon: Award,
    value: "2",
    label: "года технике",
    description: "Средний возраст",
  },
];

export default async function AboutPage() {
  const [settings, documents] = await Promise.all([
    getCompanySettings(),
    getActiveDocuments(),
  ]);

  const aboutImage = settings?.aboutImage || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";

  return (
    <main className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-6">
                О компании{" "}
                <span className="text-accent">Planteo</span>
              </h1>
              <div className="space-y-4 text-text-gray text-lg">
                <p>
                  <strong className="text-white">Planteo</strong> — лидер рынка
                  аренды строительной спецтехники в Санкт-Петербурге и
                  Ленинградской области. Более 5 лет мы обеспечиваем
                  строительные объекты надёжной техникой и квалифицированными
                  операторами.
                </p>
                <p>
                  Мы предлагаем современную
                  технику: экскаваторы, автокраны, самосвалы, манипуляторы и
                  погрузчики. Средний возраст машин — не более 2 лет, что
                  гарантирует бесперебойную работу на объекте.
                </p>
                <p>
                  Мы официально работаем с НДС 22%, предоставляем полный пакет
                  закрывающих документов и готовы к сотрудничеству как с
                  крупными застройщиками, так и с частными заказчиками.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
                  <span className="text-accent font-bold">НДС 22%</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-text-gray">Полный документооборот</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-text-gray">Договор аренды</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <img
                  src={aboutImage}
                  alt="Строительная площадка Planteo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-accent text-dark px-6 py-3 rounded-lg shadow-lg">
                <span className="font-display font-bold text-2xl">5+</span>
                <span className="block text-xs uppercase font-bold">лет опыта</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-12">
            Цифры, которые <span className="text-accent">говорят за нас</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-dark/50 rounded-xl border border-white/5 hover:border-accent/30 transition-colors"
              >
                <stat.icon className="mx-auto text-accent mb-4" size={32} />
                <div className="font-display text-4xl md:text-5xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="font-bold uppercase text-sm tracking-wide mb-1">
                  {stat.label}
                </div>
                <div className="text-text-gray text-xs">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Licenses Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-4">
            Лицензии и <span className="text-accent">допуски</span>
          </h2>
          <p className="text-text-gray text-center mb-12 max-w-xl mx-auto">
            Все необходимые разрешительные документы для выполнения работ любой
            сложности
          </p>
          
          {documents.length === 0 ? (
            <div className="text-center py-12 text-text-gray">
              <p>Документы скоро будут добавлены</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="aspect-[3/4] bg-surface border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-accent/30 transition-colors group"
                >
                  {/* Document image or placeholder */}
                  <div className="w-full flex-1 bg-white/5 rounded-lg mb-4 flex items-center justify-center border border-dashed border-white/20 group-hover:border-accent/30 transition-colors overflow-hidden">
                    {doc.imageUrl ? (
                      <img
                        src={doc.imageUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-text-gray">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-xs">Скан документа</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm uppercase">{doc.title}</h3>
                  {doc.number && (
                    <span className="text-text-gray text-xs mt-1">{doc.number}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
