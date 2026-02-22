'use client'

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OptimizedImage, MobileSwiper } from "@/components/shared";

// Тип для сериализованной машины (Decimal преобразован в number)
interface SerializedMachine {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  shiftPrice: number;
  hourlyPrice: number | null;
  specs: unknown;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
    attributes?: Array<{
      attributeId: number;
      showInCard: boolean;
    }>;
  };
  attributes?: Array<{
    attributeId: number;
    valueNumber: number | null;
    valueString: string | null;
    attribute: {
      name: string;
      unit: string | null;
    };
  }>;
}

interface SerializedCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: {
    machines: number;
  };
}

interface CatalogPreviewProps {
  machines: SerializedMachine[];
  categories: SerializedCategory[];
  totalCount: number;
}

function StatusBadge({ isAvailable }: { isAvailable: boolean }) {
  if (isAvailable) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded uppercase border border-green-400/20">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full status-live"></span>
        Свободен
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded uppercase border border-orange-400/20">
      Занят
    </span>
  );
}

function EquipmentCard({ machine }: { machine: SerializedMachine }) {
  // EAV атрибуты: получаем ID атрибутов, которые нужно показать на карточке
  const visibleAttrIds = (machine.category.attributes || [])
    .filter(ca => ca.showInCard)
    .map(ca => ca.attributeId)
  
  const features = (machine.attributes || [])
    .filter(val => visibleAttrIds.includes(val.attributeId))
    .slice(0, 4) // Максимум 4 характеристики

  return (
    <Link
      href={`/catalog/${machine.category.slug}/${machine.slug}`}
      className="product-card group bg-surface border border-white/5 rounded-xl p-6 relative overflow-hidden block"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20">
        <StatusBadge isAvailable={machine.isAvailable} />
      </div>

      {/* Image */}
      <div className="h-48 flex items-center justify-center relative mb-6">
        <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {machine.imageUrl ? (
          <OptimizedImage
            src={machine.imageUrl}
            alt={`Аренда ${machine.category.name} ${machine.title} в Санкт-Петербурге`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="tech-img object-contain relative z-10"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg">
            <span className="text-text-gray text-sm">Нет фото</span>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="font-display text-2xl font-bold uppercase mb-1">
        {machine.title}
      </h3>
      <p className="text-text-gray text-sm mb-2">{machine.category.name}</p>

      {/* EAV Атрибуты */}
      {features.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
          {features.map((feature) => {
            const value = feature.valueNumber !== null 
              ? `${feature.valueNumber}${feature.attribute.unit ? ` ${feature.attribute.unit}` : ''}`
              : feature.valueString || ''
            return (
              <div key={feature.attributeId} className="flex items-start gap-1.5 text-sm min-w-0">
                <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0 mt-1.5"></span>
                <div className="min-w-0">
                  <span className="text-text-gray">{feature.attribute.name}:</span>{' '}
                  <span className="text-white font-medium">{value}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Price & CTA */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-xs text-text-gray uppercase block">
            Смена (7+1)
          </span>
          <span className="text-2xl font-display font-bold text-accent">
            {Number(machine.shiftPrice).toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <span className="bg-white text-dark group-hover:bg-accent group-hover:scale-105 transition-all w-10 h-10 rounded-full flex items-center justify-center">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}

export function CatalogPreview({ machines, categories, totalCount }: CatalogPreviewProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Фильтруем машины по выбранной категории
  const filteredMachines = activeCategory
    ? machines.filter((m) => m.category.slug === activeCategory)
    : machines;

  return (
    <section id="catalog" className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-2">
              Наш автопарк
            </h2>
            <p className="text-text-gray">
              Регулярное ТО. Техника всегда готова к работе.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={
                activeCategory === null
                  ? "px-6 py-2 bg-white text-dark font-bold uppercase rounded hover:bg-gray-200 transition"
                  : "px-6 py-2 bg-surface border border-white/10 text-white font-bold uppercase rounded hover:border-accent hover:text-accent transition"
              }
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={
                  activeCategory === category.slug
                    ? "px-6 py-2 bg-white text-dark font-bold uppercase rounded hover:bg-gray-200 transition"
                    : "px-6 py-2 bg-surface border border-white/10 text-white font-bold uppercase rounded hover:border-accent hover:text-accent transition"
                }
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / Mobile Swiper */}
        <MobileSwiper desktopCols={3} desktopGap={8}>
          {filteredMachines.map((machine) => (
            <EquipmentCard key={machine.id} machine={machine} />
          ))}
        </MobileSwiper>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12 text-text-gray">
            В этой категории пока нет техники
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="text-white border-b border-accent pb-1 hover:text-accent transition inline-block"
          >
            Посмотреть весь каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
