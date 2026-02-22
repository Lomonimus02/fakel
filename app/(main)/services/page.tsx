import { Metadata } from "next";
import Link from "next/link";
import { 
  Users, Truck, Clock, Zap, FileText, Send, CheckCircle, 
  ArrowRight, Shield, FileCheck, Headphones, Building2 
} from "lucide-react";
import { getSiteSettings, formatPhoneForLink } from "@/lib/get-settings";
import { LeadForm, MobileSwiper } from "@/components/shared";
import { ExpandableText } from "@/components/ui/ExpandableText";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Услуги аренды спецтехники | Planteo — Аренда спецтехники",
  description:
    "Аренда спецтехники с экипажем в Санкт-Петербурге. Доставка техники, работа 24/7, срочная подача от 2 часов. Опытные машинисты.",
};

// Этапы работы
const steps = [
  {
    number: 1,
    icon: Send,
    title: "Заявка",
    description: "Оставляете заявку на сайте, в Telegram или звоните по телефону",
  },
  {
    number: 2,
    icon: Truck,
    title: "Подбор техники",
    description: "Подбираем технику под ваши задачи за 15 минут",
  },
  {
    number: 3,
    icon: FileText,
    title: "Договор/Оплата",
    description: "Оформляем договор, принимаем оплату любым способом",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "Подача на объект",
    description: "Доставляем технику с машинистом на ваш объект",
  },
];

// Преимущества
const benefits = [
  {
    icon: Building2,
    title: "Надёжность",
    description: "5 лет на рынке аренды спецтехники в СПб.",
  },
  {
    icon: FileCheck,
    title: "ЭДО",
    description: "Работаем по электронному документообороту — закрывающие за 1 день.",
  },
  {
    icon: Headphones,
    title: "24/7",
    description: "Диспетчер на связи круглосуточно. Выезд даже ночью.",
  },
  {
    icon: Shield,
    title: "Гарантия",
    description: "Оперативная подмена техники — резервная единица на объекте за 4 часа.",
  },
];

// Услуги
const services = [
  {
    icon: Users,
    title: "Аренда с экипажем",
    description:
      "Опытные машинисты с допусками и стажем от 5 лет. Все операторы — граждане РФ с официальным трудоустройством.",
    features: ["Допуски СРО", "Медицинские книжки", "Страхование"],
  },
  {
    icon: Truck,
    title: "Доставка техники",
    description:
      "Собственный парк тралов и низкорамников для перевозки техники любых габаритов. Доставим на объект в удобное время.",
    features: ["Тралы до 60 тонн", "Низкорамники", "Сопровождение ГИБДД"],
  },
  {
    icon: Clock,
    title: "Работа 24/7",
    description:
      "Выполняем заказы в ночные смены и выходные дни. Идеально для объектов с ограничением движения в дневное время.",
    features: ["Ночные смены", "Выходные и праздники", "Гибкий график"],
  },
  {
    icon: Zap,
    title: "Срочная подача",
    description:
      "Экстренная подача техники от 2 часов. Для срочных работ и аварийных ситуаций — выезжаем немедленно.",
    features: ["От 2 часов", "Диспетчер 24/7", "Приоритетная обработка"],
  },
];

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const phoneLink = formatPhoneForLink(settings.phone);

  return (
    <main className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-6xl font-bold uppercase mb-6">
            Услуги аренды{" "}
            <span className="text-accent">спецтехники</span>
          </h1>
          <p className="text-text-gray text-lg md:text-xl max-w-2xl">
            Комплексные решения для строительных и промышленных объектов
            Санкт-Петербурга и Ленинградской области
          </p>
        </div>
      </section>

      {/* Steps - Этапы работы */}
      <section className="py-12 md:py-16 bg-surface border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-12">
            Как мы работаем
          </h2>
          
          <MobileSwiper desktopCols={4} desktopGap={6}>
            {steps.map((step, index) => (
              <div key={step.number} className="relative h-full">
                {/* Стрелка между шагами (только на lg) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-2 z-10">
                    <ArrowRight className="text-accent" size={24} />
                  </div>
                )}
                
                <div className="bg-dark border border-white/10 rounded-xl p-6 text-center hover:border-accent/50 transition-all h-full">
                  {/* Номер шага */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-dark font-display font-bold text-xl mb-4">
                    {step.number}
                  </div>
                  
                  {/* Иконка */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center">
                      <step.icon className="text-accent" size={32} />
                    </div>
                  </div>
                  
                  {/* Заголовок и описание */}
                  <h3 className="font-display text-lg font-bold uppercase mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-gray text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </MobileSwiper>
        </div>
      </section>

      {/* Why Us - Почему с нами удобно */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-8">
            Почему с нами <span className="text-accent">удобно</span>
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-surface border border-white/10 rounded-xl p-5 md:p-6 text-center hover:border-accent/30 transition-all"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="text-accent" size={24} />
                  </div>
                </div>
                <h3 className="font-display text-base md:text-lg font-bold uppercase mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-gray text-xs md:text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase text-center mb-8">
            Наши <span className="text-accent">услуги</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-surface border border-white/10 rounded-xl p-6 lg:p-8 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="text-accent" size={28} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl lg:text-2xl font-bold uppercase mb-2">
                      {service.title}
                    </h3>
                    <p className="text-text-gray text-sm lg:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                  {service.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs uppercase tracking-wide bg-white/5 px-3 py-1.5 rounded-full text-text-gray"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with LeadForm */}
      <section className="py-16 md:py-20 mt-8 bg-gradient-to-br from-surface via-dark to-surface border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
              Не хотите <span className="text-accent">искать сами?</span>
            </h2>
            <p className="text-text-gray text-lg mb-8">
              Оставьте номер — подберём технику под ваши задачи за 15 минут
            </p>
            
            {/* Compact Lead Form */}
            <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
              <LeadForm 
                mode="compact"
                source="Страница Услуги — CTA"
                buttonText="Подобрать"
              />
            </div>
            
            {/* Alternative: Phone link */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-text-gray text-sm">или позвоните:</span>
              <a
                href={`tel:${phoneLink}`}
                className="text-accent hover:text-accent-hover font-bold text-lg transition-colors"
              >
                {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 border-2 border-accent text-accent hover:bg-accent hover:text-dark font-bold uppercase px-8 py-4 text-lg rounded-lg transition-all"
          >
            <Truck size={24} />
            Перейти в каталог техники
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* SEO Text Block */}
      <section className="py-12 md:py-16 bg-surface border-t border-white/5">
        <div className="container mx-auto px-4">
          <ExpandableText maxHeight="200px">
            <div className="prose prose-invert prose-sm max-w-none text-text-gray space-y-4">
              <h2 className="text-white font-display text-xl font-bold uppercase">
                Аренда спецтехники в Санкт-Петербурге — Planteo
              </h2>
              <p>
                Компания Planteo предоставляет услуги аренды строительной и специальной техники
                в Санкт-Петербурге и Ленинградской области. В нашем парке — экскаваторы, автокраны,
                погрузчики, самосвалы и другая спецтехника ведущих мировых производителей.
                Вся техника проходит регулярное техническое обслуживание и готова к работе 24/7.
              </p>
              <p>
                Мы работаем как с юридическими, так и с физическими лицами. Для корпоративных
                клиентов действуют специальные условия: отсрочка платежа, электронный документооборот
                (ЭДО), выделенный менеджер. Оформление договора занимает не более 30 минут,
                а подача техники на объект — от 2 часов с момента заявки.
              </p>
              <p>
                Аренда спецтехники с экипажем — наша основная специализация. Все машинисты
                и операторы имеют стаж работы от 5 лет, необходимые допуски и удостоверения.
                Мы гарантируем безопасность работ и несём полную ответственность за технику
                и персонал на объекте.
              </p>
              <p>
                Доставка техники осуществляется собственным парком тралов и низкорамников
                грузоподъёмностью до 60 тонн. Работаем по всей территории Санкт-Петербурга
                и Ленинградской области, включая удалённые объекты. Для негабаритных перевозок
                организуем сопровождение ГИБДД.
              </p>
              <p>
                Свяжитесь с нами по телефону {settings.phone} или оставьте заявку
                на сайте — подберём оптимальное решение для вашего проекта.
              </p>
            </div>
          </ExpandableText>
        </div>
      </section>
    </main>
  );
}
