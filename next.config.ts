import type { NextConfig } from "next";

// Парсим хост из S3_ENDPOINT для настройки next/image
function getS3RemotePattern(): { protocol: 'https' | 'http'; hostname: string } | null {
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) return null;
  
  try {
    const url = new URL(endpoint);
    return {
      protocol: url.protocol.replace(':', '') as 'https' | 'http',
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}

const s3Pattern = getS3RemotePattern();

const nextConfig: NextConfig = {
  // Настройка оптимизации изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // S3/MinIO хранилище
      ...(s3Pattern ? [{
        protocol: s3Pattern.protocol as 'https' | 'http',
        hostname: s3Pattern.hostname,
      }] : []),
      // Общие S3-совместимые хранилища
      {
        protocol: 'https',
        hostname: 's3.timeweb.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'minio',
      },
    ],
    // Включаем оптимизацию изображений (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
  },
  // Увеличиваем лимит для API
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    // Запускаем webpack-компиляцию в отдельном воркере (параллельно


    // Оптимизация тяжёлых barrel-экспортов (ускоряет tree-shaking)
    optimizePackageImports: [
      'lucide-react',
      '@aws-sdk/client-s3',
      'react-markdown',
      'embla-carousel-react',
    ],
  },
  // Для деплоя на Render
  output: 'standalone',
  // Отключаем проверки типов и линтера при сборке для ускорения (особенно на слабых VPS)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
