import { Truck, Clock, FileCheck, Shield } from "lucide-react"

const advantages = [
  {
    icon: Truck,
    title: "Свой парк",
    description: "Цены ниже на 15%, так как нет посредников. Вся техника на балансе компании.",
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
  {
    icon: Clock,
    title: "Работаем 24/7",
    description: "Отгружаем технику ночью и в выходные. Быстрый выезд на объект.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    icon: FileCheck,
    title: "Документы",
    description: "Идеальная бухгалтерия: ЭДО, НДС 22%, акты и счета-фактуры день в день.",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    icon: Shield,
    title: "Надёжность",
    description: "Техника не старше 3 лет. Опытные машинисты РФ с допусками.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
]

export function Advantages() {
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
            Почему выбирают{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-600">
              нас
            </span>
          </h2>
          <p className="text-text-gray max-w-2xl mx-auto">
            Мы не просто сдаём технику — мы решаем ваши задачи. 
            Работаем с 2015 года, более 1000 довольных клиентов.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-dark rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${advantage.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <advantage.icon className={advantage.color} size={28} />
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold mb-2 text-white">
                {advantage.title}
              </h3>

              {/* Description */}
              <p className="text-text-gray text-sm leading-relaxed">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
