import { Letter } from '../types';

interface SEOOptions {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  robots?: 'index, follow' | 'noindex, nofollow';
  jsonLd?: Record<string, any>;
}

const DEFAULT_TITLE = 'Chithighor (চিঠিঘর) - কিছু কথা চিঠিতেই সুন্দর';
const DEFAULT_DESCRIPTION = 'কিছু কথা চিঠিতেই সুন্দর — Anonymous & heartfelt digital letters, warm nostalgic community, and physical keepsake delivery.';
const DEFAULT_ROBOTS = 'index, follow';

function setMetaTag(selector: string, attrName: string, attrVal: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setJsonLd(data: Record<string, any> | null) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('chithighor-jsonld');
  if (existing) {
    existing.remove();
  }

  if (data) {
    const script = document.createElement('script');
    script.id = 'chithighor-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/**
 * Updates page title, meta description, Open Graph, Twitter cards, robots, and JSON-LD
 */
export function updatePageSEO(options: SEOOptions) {
  if (typeof document === 'undefined') return;

  const title = options.title ? `${options.title} — চিঠিঘর (Chithighor)` : DEFAULT_TITLE;
  const description = options.description || DEFAULT_DESCRIPTION;
  const url = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const robots = options.robots || DEFAULT_ROBOTS;
  const type = options.type || 'website';

  // 1. Document Title
  document.title = title;

  // 2. Standard Meta
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="robots"]', 'name', 'robots', robots);

  // 3. OpenGraph
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Chithighor (চিঠিঘর)');

  // 4. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  // 5. Schema.org JSON-LD
  setJsonLd(options.jsonLd || null);
}

/**
 * Configure SEO specifically for a Letter
 * Enforces NOINDEX on private, unlisted, draft, or moderated letters.
 */
export function updateLetterSEO(letter: Letter) {
  const isPubliclyIndexable =
    letter.visibility === 'public' && !letter.isDraft && !letter.isModerated;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?letter=${letter.id}`
    : '';

  if (!isPubliclyIndexable) {
    // Strictly forbid search indexing for private/unlisted/draft letters
    updatePageSEO({
      title: 'ব্যক্তিগত চিঠি (Private Letter)',
      description: 'এই চিঠিটি একটি সংরক্ষিত ও ব্যক্তিগত চিঠি। শুধুমাত্র নির্দিষ্ট প্রাপক এটি পড়তে পারেন।',
      url: currentUrl,
      type: 'article',
      robots: 'noindex, nofollow',
      jsonLd: undefined,
    });
    return;
  }

  // Clean excerpt for meta description
  const cleanExcerpt = letter.content
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 150);
  const metaDescription = `${cleanExcerpt}... — চিঠিঘরের উন্মুক্ত মেলায় পড়ুন`;

  const authorName = letter.isAnonymous ? 'অচেনা লেখক (Anonymous)' : (letter.authorName || 'চিঠিবন্ধু');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: letter.title,
    description: cleanExcerpt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished: letter.createdAt,
    dateModified: letter.updatedAt || letter.createdAt,
    inLanguage: letter.language || 'bn',
    mainEntityOfPage: currentUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Chithighor (চিঠিঘর)',
      logo: {
        '@type': 'ImageObject',
        url: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
      },
    },
  };

  updatePageSEO({
    title: letter.title,
    description: metaDescription,
    url: currentUrl,
    type: 'article',
    robots: 'index, follow',
    jsonLd,
  });
}

/**
 * Resets SEO to the default home/community state
 */
export function resetDefaultSEO(tabName?: string) {
  const isPrivateTab = ['dashboard', 'admin', 'write'].includes(tabName || '');

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Chithighor (চিঠিঘর)',
    applicationCategory: 'SocialApplication',
    operatingSystem: 'All',
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
    },
  };

  updatePageSEO({
    title: tabName === 'community' ? 'চিঠির মেলা (Community Letters)' : undefined,
    description: DEFAULT_DESCRIPTION,
    robots: isPrivateTab ? 'noindex, nofollow' : 'index, follow',
    jsonLd: isPrivateTab ? undefined : defaultJsonLd,
  });
}
