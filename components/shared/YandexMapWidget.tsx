import { MapPin } from "lucide-react";

interface YandexMapWidgetProps {
  /** Адрес для отображения на карте */
  address: string;
  /** Пользовательский iframe (если задан в настройках — используется вместо автогенерации) */
  mapIframe?: string | null;
  /** Название компании для бейджа */
  companyName?: string;
  /** Высота контейнера */
  className?: string;
}

/**
 * Динамический виджет Яндекс.Карт.
 * Если передан `mapIframe` — рендерит его как есть.
 * Иначе — формирует URL по адресу через Yandex Map Widget API.
 */
export function YandexMapWidget({
  address,
  mapIframe,
  companyName = "Planteo",
  className = "h-[400px] md:h-[500px]",
}: YandexMapWidgetProps) {
  const mapUrl = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=16`;

  return (
    <div className={`relative w-full ${className}`}>
      {mapIframe ? (
        <div
          className="w-full h-full grayscale contrast-125 opacity-80 [&>iframe]:w-full [&>iframe]:h-full"
          dangerouslySetInnerHTML={{ __html: mapIframe }}
        />
      ) : (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="grayscale contrast-125 opacity-80"
          title={`Карта — ${companyName}`}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-dark via-transparent to-dark/50" />

      {/* Location badge */}
      <div className="absolute top-6 left-6 bg-dark/90 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent flex items-center justify-center rounded">
            <MapPin className="text-dark" size={20} />
          </div>
          <div>
            <div className="font-bold text-sm">{companyName}</div>
            <div className="text-text-gray text-xs">{address}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
