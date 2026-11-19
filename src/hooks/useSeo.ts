import { useEffect } from 'react';

interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function useSeo({
  title,
  description,
  path,
  image,
  imageAlt,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SeoConfig) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${path ?? window.location.pathname}`;
    const rawImage = image || '/assets/aistudio/Autolux_46ec3fca.png';
    const absoluteImage = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`;
    const resolvedAlt = imageAlt || `${title} — AutoLux USA`;

    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', absoluteImage);
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', resolvedAlt);
    setMeta('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImage);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', resolvedAlt);

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const scriptId = 'autolux-dynamic-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, imageAlt, ogType, noindex, jsonLd]);
}
