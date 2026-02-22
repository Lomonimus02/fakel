import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Динамические страницы категорий (ЧПУ)
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/catalog/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Динамические страницы товаров (ЧПУ: /catalog/[category]/[slug])
  const machines = await prisma.machine.findMany({
    where: {
      isAvailable: true,
    },
    select: {
      slug: true,
      updatedAt: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  const machinePages: MetadataRoute.Sitemap = machines
    .filter((machine) => machine.category?.slug && machine.slug)
    .map((machine) => ({
      url: `${baseUrl}/catalog/${machine.category.slug}/${machine.slug}`,
      lastModified: machine.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [...staticPages, ...categoryPages, ...machinePages];
}
