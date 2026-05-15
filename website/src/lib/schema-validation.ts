// Schema validation core.
// Every required/recommended field rule cites its Google docs source URL.
// Source: https://developers.google.com/search/docs/appearance/structured-data/

export type SchemaType = 'Product' | 'FAQPage' | 'LocalBusiness' | 'Article';

export interface FieldDef {
  property: string;
  label: string;
  type: 'text' | 'url' | 'number' | 'textarea' | 'select';
  required: boolean;
  recommended: boolean;
  placeholder?: string;
  options?: string[];
  hint?: string;
  /** Google docs URL that defines this requirement */
  source: string;
}

export interface ValidationError {
  property: string;
  message: string;
}

export interface ValidationWarning {
  property: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// ---------------------------------------------------------------------------
// Field definitions per type
// ---------------------------------------------------------------------------

// Source: https://developers.google.com/search/docs/appearance/structured-data/product
const PRODUCT_FIELDS: FieldDef[] = [
  { property: 'name', label: 'Product Name', type: 'text', required: true, recommended: false, placeholder: 'Classic Leather Wallet', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'image', label: 'Image URL', type: 'url', required: true, recommended: false, placeholder: 'https://example.com/product.jpg', hint: 'Use a high-quality image (min 50×50px). Google requires at least one image.', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'description', label: 'Description', type: 'textarea', required: false, recommended: true, placeholder: 'Describe the product...', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'sku', label: 'SKU', type: 'text', required: false, recommended: true, placeholder: 'WALLET-001', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'brand', label: 'Brand Name', type: 'text', required: false, recommended: true, placeholder: 'CraftCo', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'price', label: 'Price', type: 'number', required: true, recommended: false, placeholder: '49.99', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'priceCurrency', label: 'Currency (ISO 4217)', type: 'text', required: true, recommended: false, placeholder: 'USD', hint: 'Use ISO 4217 codes: USD, EUR, GBP, AUD, etc.', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'availability', label: 'Availability', type: 'select', required: false, recommended: true, options: ['https://schema.org/InStock', 'https://schema.org/OutOfStock', 'https://schema.org/PreOrder', 'https://schema.org/Discontinued'], source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'priceValidUntil', label: 'Price Valid Until (YYYY-MM-DD)', type: 'text', required: false, recommended: true, placeholder: '2026-12-31', hint: 'Set a future date. Without this, Google may treat the price as expired.', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'ratingValue', label: 'Rating (0–5)', type: 'number', required: false, recommended: true, placeholder: '4.7', hint: 'Only include if ratings are visible to users on this page.', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
  { property: 'reviewCount', label: 'Review Count', type: 'number', required: false, recommended: true, placeholder: '128', source: 'https://developers.google.com/search/docs/appearance/structured-data/product' },
];

// Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage
const FAQ_FIELDS: FieldDef[] = [
  { property: 'q1', label: 'Question 1', type: 'text', required: true, recommended: false, placeholder: 'What is JSON-LD?', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
  { property: 'a1', label: 'Answer 1', type: 'textarea', required: true, recommended: false, placeholder: 'JSON-LD is a method of encoding linked data using JSON...', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
  { property: 'q2', label: 'Question 2', type: 'text', required: false, recommended: true, placeholder: 'Second question (optional)...', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
  { property: 'a2', label: 'Answer 2', type: 'textarea', required: false, recommended: true, placeholder: 'Second answer...', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
  { property: 'q3', label: 'Question 3', type: 'text', required: false, recommended: false, placeholder: 'Third question (optional)...', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
  { property: 'a3', label: 'Answer 3', type: 'textarea', required: false, recommended: false, placeholder: 'Third answer...', source: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage' },
];

// Source: https://developers.google.com/search/docs/appearance/structured-data/local-business
const LOCAL_BUSINESS_FIELDS: FieldDef[] = [
  { property: 'name', label: 'Business Name', type: 'text', required: true, recommended: false, placeholder: 'The Corner Café', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'url', label: 'Website URL', type: 'url', required: false, recommended: true, placeholder: 'https://cornercafe.example.com', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'telephone', label: 'Phone Number', type: 'text', required: false, recommended: true, placeholder: '+1-555-123-4567', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'streetAddress', label: 'Street Address', type: 'text', required: true, recommended: false, placeholder: '123 Main St', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'addressLocality', label: 'City', type: 'text', required: true, recommended: false, placeholder: 'Springfield', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'addressRegion', label: 'State / Region', type: 'text', required: false, recommended: true, placeholder: 'IL', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'postalCode', label: 'Postal / ZIP Code', type: 'text', required: false, recommended: true, placeholder: '62701', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'addressCountry', label: 'Country (ISO 3166)', type: 'text', required: true, recommended: false, placeholder: 'US', hint: 'Two-letter ISO 3166 code: US, GB, AU, DE, etc.', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'image', label: 'Business Image URL', type: 'url', required: false, recommended: true, placeholder: 'https://cornercafe.example.com/photo.jpg', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'ratingValue', label: 'Rating (0–5)', type: 'number', required: false, recommended: true, placeholder: '4.5', hint: 'Only include if ratings are visible to users on this page.', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
  { property: 'reviewCount', label: 'Review Count', type: 'number', required: false, recommended: true, placeholder: '89', source: 'https://developers.google.com/search/docs/appearance/structured-data/local-business' },
];

// Source: https://developers.google.com/search/docs/appearance/structured-data/article
const ARTICLE_FIELDS: FieldDef[] = [
  { property: 'headline', label: 'Headline', type: 'text', required: true, recommended: false, placeholder: 'Getting Started with JSON-LD', hint: 'Max 110 characters recommended for rich results.', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'image', label: 'Image URL', type: 'url', required: true, recommended: false, placeholder: 'https://example.com/article-image.jpg', hint: 'Min 1200px wide recommended. Google requires at least one image.', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'datePublished', label: 'Date Published (YYYY-MM-DD)', type: 'text', required: true, recommended: false, placeholder: '2026-05-01', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'dateModified', label: 'Date Modified (YYYY-MM-DD)', type: 'text', required: false, recommended: true, placeholder: '2026-05-10', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'authorName', label: 'Author Name', type: 'text', required: true, recommended: false, placeholder: 'Jane Smith', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'authorUrl', label: 'Author Profile URL', type: 'url', required: false, recommended: true, placeholder: 'https://example.com/authors/jane', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'publisherName', label: 'Publisher Name', type: 'text', required: true, recommended: false, placeholder: 'Example Blog', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'publisherLogo', label: 'Publisher Logo URL', type: 'url', required: true, recommended: false, placeholder: 'https://example.com/logo.png', hint: 'Recommended dimensions: 600×60px or similar.', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
  { property: 'description', label: 'Description', type: 'textarea', required: false, recommended: true, placeholder: 'A brief summary of the article...', source: 'https://developers.google.com/search/docs/appearance/structured-data/article' },
];

export const SCHEMA_FIELDS: Record<SchemaType, FieldDef[]> = {
  Product: PRODUCT_FIELDS,
  FAQPage: FAQ_FIELDS,
  LocalBusiness: LOCAL_BUSINESS_FIELDS,
  Article: ARTICLE_FIELDS,
};

export const SCHEMA_TITLES: Record<SchemaType, string> = {
  Product: 'Product',
  FAQPage: 'FAQ Page',
  LocalBusiness: 'Local Business',
  Article: 'Article',
};

export const SCHEMA_DOCS: Record<SchemaType, string> = {
  Product: 'https://developers.google.com/search/docs/appearance/structured-data/product',
  FAQPage: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
  LocalBusiness: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
  Article: 'https://developers.google.com/search/docs/appearance/structured-data/article',
};

// ---------------------------------------------------------------------------
// JSON-LD builders
// ---------------------------------------------------------------------------

export function buildProductJsonLd(values: Record<string, string>): object {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": values.name || '',
  };
  if (values.image) ld.image = values.image;
  if (values.description) ld.description = values.description;
  if (values.sku) ld.sku = values.sku;
  if (values.brand) ld.brand = { "@type": "Brand", "name": values.brand };

  if (values.price || values.priceCurrency) {
    const offer: Record<string, string> = { "@type": "Offer" };
    if (values.price) offer.price = values.price;
    if (values.priceCurrency) offer.priceCurrency = values.priceCurrency;
    if (values.availability) offer.availability = values.availability;
    if (values.priceValidUntil) offer.priceValidUntil = values.priceValidUntil;
    ld.offers = offer;
  }

  if (values.ratingValue && values.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": values.ratingValue,
      "reviewCount": values.reviewCount,
    };
  }
  return ld;
}

export function buildFaqJsonLd(values: Record<string, string>): object {
  const questions = [];
  for (let i = 1; i <= 3; i++) {
    const q = values[`q${i}`];
    const a = values[`a${i}`];
    if (q && a) {
      questions.push({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a },
      });
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions,
  };
}

export function buildLocalBusinessJsonLd(values: Record<string, string>): object {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": values.name || '',
    "address": {
      "@type": "PostalAddress",
      "streetAddress": values.streetAddress || '',
      "addressLocality": values.addressLocality || '',
      "addressRegion": values.addressRegion || '',
      "postalCode": values.postalCode || '',
      "addressCountry": values.addressCountry || '',
    },
  };
  if (values.url) ld.url = values.url;
  if (values.telephone) ld.telephone = values.telephone;
  if (values.image) ld.image = values.image;
  if (values.ratingValue && values.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": values.ratingValue,
      "reviewCount": values.reviewCount,
    };
  }
  return ld;
}

export function buildArticleJsonLd(values: Record<string, string>): object {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": values.headline || '',
    "image": values.image || '',
    "datePublished": values.datePublished || '',
    "author": {
      "@type": "Person",
      "name": values.authorName || '',
      ...(values.authorUrl ? { "url": values.authorUrl } : {}),
    },
    "publisher": {
      "@type": "Organization",
      "name": values.publisherName || '',
      "logo": { "@type": "ImageObject", "url": values.publisherLogo || '' },
    },
  };
  if (values.dateModified) ld.dateModified = values.dateModified;
  if (values.description) ld.description = values.description;
  return ld;
}

export const BUILDERS: Record<SchemaType, (values: Record<string, string>) => object> = {
  Product: buildProductJsonLd,
  FAQPage: buildFaqJsonLd,
  LocalBusiness: buildLocalBusinessJsonLd,
  Article: buildArticleJsonLd,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateSchema(type: SchemaType, values: Record<string, string>): ValidationResult {
  const fields = SCHEMA_FIELDS[type];
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const field of fields) {
    const val = (values[field.property] || '').trim();
    if (field.required && !val) {
      errors.push({ property: field.property, message: `${field.label} is required.` });
    }
  }

  // Type-specific cross-field checks
  if (type === 'Product') {
    const price = values.price;
    const currency = values.priceCurrency;
    if (price && !currency) errors.push({ property: 'priceCurrency', message: 'Currency is required when price is set.' });
    if (currency && !/^[A-Z]{3}$/.test(currency.trim())) warnings.push({ property: 'priceCurrency', message: 'Currency should be a 3-letter ISO 4217 code (e.g. USD, GBP).' });
    const rating = values.ratingValue;
    const count = values.reviewCount;
    if (rating && !count) warnings.push({ property: 'reviewCount', message: 'Review count is strongly recommended when rating is set.' });
    if (count && !rating) warnings.push({ property: 'ratingValue', message: 'Rating value is strongly recommended when review count is set.' });
    if (rating && (parseFloat(rating) < 0 || parseFloat(rating) > 5)) warnings.push({ property: 'ratingValue', message: 'Rating value should be between 0 and 5.' });
  }

  if (type === 'FAQPage') {
    if (!values.q1 || !values.a1) {
      errors.push({ property: 'q1', message: 'At least one question and answer pair is required.' });
    }
    if ((values.q2 && !values.a2) || (!values.q2 && values.a2)) {
      warnings.push({ property: 'a2', message: 'Each question must have a corresponding answer.' });
    }
  }

  if (type === 'Article') {
    const pub = values.datePublished;
    if (pub && !/^\d{4}-\d{2}-\d{2}/.test(pub)) {
      warnings.push({ property: 'datePublished', message: 'Use ISO 8601 format: YYYY-MM-DD.' });
    }
    if (values.headline && values.headline.length > 110) {
      warnings.push({ property: 'headline', message: `Headline is ${values.headline.length} characters. Google recommends under 110 for rich results.` });
    }
  }

  if (type === 'LocalBusiness') {
    const country = values.addressCountry;
    if (country && !/^[A-Z]{2}$/.test(country.trim())) {
      warnings.push({ property: 'addressCountry', message: 'Country should be a 2-letter ISO 3166 code (e.g. US, GB).' });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
