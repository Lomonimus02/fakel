import {
  HeroSection,
  CatalogPreview,
  WhyUs,
  LeadFormSection,
  ClientsMarquee,
  ReviewsSection,
  LeadCalculator,
} from "@/components/home";
import { getFeaturedMachinesSerialized, getCategoriesSerialized, getMachinesCount, getCategoriesWithMinPrices } from "@/lib/data";
import { getVisibleReviews } from "@/lib/actions/reviews";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [machines, categories, totalCount, reviews, categoriesWithPrices] = await Promise.all([
    getFeaturedMachinesSerialized(6),
    getCategoriesSerialized(),
    getMachinesCount(),
    getVisibleReviews(),
    getCategoriesWithMinPrices(),
  ]);

  return (
    <>
      {/* 1. Главный экран */}
      <HeroSection />
      {/* 2. Нам доверяют (логотипы клиентов) */}
      <ClientsMarquee />
      {/* 3. Каталог техники */}
      <CatalogPreview 
        machines={machines} 
        categories={categories} 
        totalCount={totalCount} 
      />
      {/* 4. Онлайн-калькулятор */}
      <LeadCalculator categories={categoriesWithPrices} />
      {/* 5. Почему мы / О компании */}
      <WhyUs />
      {/* 6. Отзывы клиентов */}
      <ReviewsSection reviews={reviews} />
      {/* 7. Финальный блок захвата */}
      <LeadFormSection />
    </>
  );
}
