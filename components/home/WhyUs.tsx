import { CheckCircle, Clock, Wrench, Users } from "lucide-react";

const stats = [
  {
    icon: CheckCircle,
    value: "98%",
    label: "Заказов выполняются в срок без опозданий",
    iconColor: "text-green-400",
    iconBg: "bg-green-400/20",
    valueColor: "text-accent",
  },
  {
    icon: Wrench,
    value: "2",
    suffix: "года",
    label: "Средний возраст техники. Нет старого хлама.",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/20",
    valueColor: "text-white",
  },
  {
    icon: Clock,
    value: "5",
    suffix: "лет",
    label: "На рынке аренды спецтехники",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/20",
    valueColor: "text-white",
  },
  {
    icon: Users,
    value: "50+",
    label: "Штат квалифицированных машинистов",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/20",
    valueColor: "text-white",
  },
];

export function WhyUs() {
  return (
    <section className="py-16 md:py-20 bg-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
            Цифры{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-600">
              говорят
            </span>
          </h2>
          <p className="text-text-gray max-w-2xl mx-auto">
            Результаты, которыми мы гордимся
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-white/10 p-6 hover:border-accent/50 transition-all group text-center"
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.iconColor} size={32} />
              </div>

              {/* Value */}
              <div className={`text-4xl md:text-5xl font-display font-bold mb-2 ${stat.valueColor}`}>
                {stat.value}
                {stat.suffix && (
                  <span className="text-accent text-xl ml-1">{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className="text-sm text-text-gray uppercase tracking-wide leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
