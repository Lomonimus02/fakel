import { CheckCircle, Clock, FileText, HardHat } from "lucide-react";

const triggers = [
  { icon: CheckCircle, text: "Пропуска в центр и на КАД" },
  { icon: Clock, text: "Работаем 24/7 без выходных" },
  { icon: FileText, text: "Работаем с НДС 22%" },
  { icon: HardHat, text: "Опытные машинисты РФ" },
];

export function TrustTriggers() {
  return (
    <section
      className="bg-accent text-dark py-4 overflow-hidden border-y border-yellow-600 relative z-20"
      aria-label="Преимущества"
    >
      {/* Desktop: статичная строка */}
      <div className="hidden md:flex container mx-auto px-4 justify-between items-center text-sm md:text-base font-bold uppercase tracking-wider whitespace-nowrap gap-8">
        {triggers.map((trigger, index) => (
          <span key={index} className="flex items-center gap-2">
            <trigger.icon size={18} />
            {trigger.text}
          </span>
        ))}
      </div>
      
      {/* Mobile: marquee бегущая строка */}
      <div className="md:hidden overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* Дублируем контент для бесшовной анимации */}
          {[...triggers, ...triggers].map((trigger, index) => (
            <span key={index} className="flex items-center gap-2 mx-6 text-sm font-bold uppercase tracking-wider">
              <trigger.icon size={16} className="flex-shrink-0" />
              {trigger.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
