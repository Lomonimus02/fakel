import { Header, Footer } from "@/components/layout";
import { getSiteSettings } from "@/lib/get-settings";
import { getCategories } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  const catalogLinks = categories.map((c) => ({
    href: `/catalog/${c.slug}`,
    label: c.name,
  }));
  
  return (
    <>
      <Header settings={settings} />
      <main className="pt-20">{children}</main>
      <Footer settings={settings} catalogLinks={catalogLinks} />
    </>
  );
}
