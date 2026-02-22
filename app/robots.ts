import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === "true";

  // На стейджинге полностью блокируем индексацию
  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/login/",
          // Блокируем фильтрованные страницы каталога (EAV параметры)
          "/catalog?*_min=*",
          "/catalog?*_max=*",
          "/catalog?*minPrice=*",
          "/catalog?*maxPrice=*",
          "/catalog?*highlight=*",
        ],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/login/",
          "/catalog?*_min=*",
          "/catalog?*_max=*",
          "/catalog?*minPrice=*",
          "/catalog?*maxPrice=*",
          "/catalog?*highlight=*",
        ],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/login/",
          "/catalog?*_min=*",
          "/catalog?*_max=*",
          "/catalog?*minPrice=*",
          "/catalog?*maxPrice=*",
          "/catalog?*highlight=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
