import { useState } from 'preact/hooks';
import { SerpMock, EligibilityList, SUPPORTED_TYPES, getPrimaryType } from './SerpPreview';

// ---------------------------------------------------------------------------
// Example JSON-LD snippets for the loader buttons
// ---------------------------------------------------------------------------

const EXAMPLES: Record<string, string> = {
  Product: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Classic Leather Wallet",
    "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
    "description": "Handcrafted full-grain leather wallet with 6 card slots.",
    "brand": { "@type": "Brand", "name": "CraftCo" },
    "sku": "WALLET-BRN-001",
    "offers": {
      "@type": "Offer",
      "price": "49.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "128"
    }
  }, null, 2),

  FAQ: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is JSON-LD structured data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "JSON-LD is Google's recommended format for structured data. It's a JSON script block that tells search engines what your content is — product, article, FAQ, and more."
        }
      },
      {
        "@type": "Question",
        "name": "Does structured data improve rankings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not directly. It makes pages eligible for rich results — star ratings, FAQ dropdowns, product prices — which typically improve click-through rates."
        }
      },
      {
        "@type": "Question",
        "name": "Is it free to add structured data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Structured data is just markup you add to your HTML. No cost, no third-party service required."
        }
      }
    ]
  }, null, 2),

  Article: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Getting Started with JSON-LD Structured Data",
    "image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    "datePublished": "2026-05-01",
    "dateModified": "2026-05-10",
    "author": { "@type": "Person", "name": "Jane Smith", "url": "https://example.com/jane" },
    "publisher": {
      "@type": "Organization",
      "name": "Tech Blog",
      "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
    },
    "description": "A practical guide to implementing JSON-LD structured data to unlock rich results in Google Search."
  }, null, 2),

  LocalBusiness: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "The Corner Café",
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    "telephone": "+1-555-123-4567",
    "url": "https://cornercafe.example.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": "Springfield",
      "addressRegion": "IL",
      "postalCode": "62701",
      "addressCountry": "US"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "89"
    }
  }, null, 2),

  Event: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Annual Developer Conference",
    "startDate": "2026-09-15T09:00",
    "endDate": "2026-09-17T18:00",
    "location": {
      "@type": "Place",
      "name": "Tech Convention Center",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Francisco",
        "addressCountry": "US"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "299",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://example.com/tickets"
    }
  }, null, 2),

  Recipe: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "Classic Spaghetti Carbonara",
    "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
    "author": { "@type": "Person", "name": "Mario Rossi" },
    "datePublished": "2026-03-10",
    "description": "Authentic Roman carbonara with guanciale, egg yolks, and Pecorino Romano.",
    "totalTime": "PT30M",
    "recipeYield": "4 servings",
    "recipeIngredient": [
      "400g spaghetti",
      "200g guanciale",
      "4 egg yolks",
      "100g Pecorino Romano"
    ],
    "recipeInstructions": [
      { "@type": "HowToStep", "text": "Cook pasta in salted boiling water until al dente." },
      { "@type": "HowToStep", "text": "Render guanciale in a pan until crispy." },
      { "@type": "HowToStep", "text": "Whisk egg yolks with grated cheese." },
      { "@type": "HowToStep", "text": "Combine all ingredients off the heat, adding pasta water to adjust consistency." }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "312"
    }
  }, null, 2),
};

// ---------------------------------------------------------------------------
// Parse helpers
// ---------------------------------------------------------------------------

interface ParsedSchema { '@type': string | string[]; [key: string]: unknown }

function parseJsonLd(raw: string): { schemas: ParsedSchema[]; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    if (parsed['@graph']) return { schemas: parsed['@graph'], error: null };
    if (Array.isArray(parsed)) return { schemas: parsed, error: null };
    return { schemas: [parsed], error: null };
  } catch (e) {
    return { schemas: [], error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RichResultPreview() {
  const [raw, setRaw] = useState(EXAMPLES.Product);

  const { schemas, error } = parseJsonLd(raw);
  const supported = schemas.filter(s => {
    const t = s['@type'];
    const types = Array.isArray(t) ? t : t ? [t] : [];
    return types.some(t => SUPPORTED_TYPES.includes(t));
  });
  const unsupported = schemas.filter(s => !supported.includes(s));

  return (
    <div class="grid lg:grid-cols-2 gap-8">

      {/* Left: input */}
      <div>
        {/* Example loader */}
        <div class="mb-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500 mb-2">Load example</p>
          <div class="flex flex-wrap gap-1.5">
            {Object.keys(EXAMPLES).map(key => (
              <button
                key={key}
                onClick={() => setRaw(EXAMPLES[key])}
                class="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <label class="block text-[13px] font-semibold text-gray-700 mb-2">
          Paste your JSON-LD
        </label>
        <textarea
          class="w-full h-72 font-mono text-[12px] bg-white text-gray-800 rounded-xl p-4 outline-none resize-y border border-gray-200 focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-[border-color,box-shadow] duration-150 leading-relaxed"
          value={raw}
          onInput={(e) => setRaw((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />

        {error && (
          <div class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700 font-mono">
            Parse error: {error}
          </div>
        )}
        {!error && unsupported.length > 0 && (
          <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-[12px] text-blue-800">
            {unsupported.map(s => getPrimaryType(s as Parameters<typeof getPrimaryType>[0])).join(', ')} detected but not previewable here.
            Use <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" class="underline font-semibold">Google Rich Results Test</a> for the full check.
          </div>
        )}

        <div class="mt-3 p-3.5 bg-yellow-50 border border-yellow-200 rounded-xl text-[11.5px] text-yellow-900 leading-relaxed">
          <strong>Accuracy disclaimer:</strong> This preview models what Google has documented as eligible for rich results.
          Whether Google <em>actually</em> shows a rich result depends on page quality, query intent, crawl date, and other signals.
          Always verify with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" class="underline font-semibold">Google Rich Results Test</a>.
        </div>
      </div>

      {/* Right: preview + eligibility */}
      <div class="space-y-6">
        {!error && supported.length === 0 && (
          <div class="text-center text-gray-400 py-16 border border-dashed border-gray-200 rounded-2xl">
            <div class="mb-3 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
            <p class="text-[13px] font-semibold text-gray-600">No previewable schema detected.</p>
            <p class="text-[12px] mt-1 text-gray-400">Supported: {SUPPORTED_TYPES.join(', ')}</p>
          </div>
        )}

        {supported.map((schema, i) => {
          const type = getPrimaryType(schema as Parameters<typeof getPrimaryType>[0]);
          return (
            <div key={i} class="space-y-4">
              <div class="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">{type} Preview</div>
              <div class="overflow-x-auto">
                <SerpMock schema={schema as Parameters<typeof SerpMock>[0]['schema']} />
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <EligibilityList schema={schema as Parameters<typeof EligibilityList>[0]['schema']} />
              </div>
            </div>
          );
        })}

        {!error && supported.length > 0 && (
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank" rel="noopener"
            class="flex items-center justify-between w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-5 rounded-xl no-underline transition-colors duration-150 text-[13px]"
          >
            <span>Validate with Google Rich Results Test</span>
            <span>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
