import type { NextConfig } from 'next';

const pagesExport = process.env.GITHUB_PAGES === 'true';
const basePath = pagesExport ? (process.env.PAGES_BASE_PATH ?? '/qhipaNasa') : '';

const config: NextConfig = {
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(pagesExport && {
    output: 'export',
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default config;
