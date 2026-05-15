import { useState, useEffect, useCallback } from 'preact/hooks';
import {
  SCHEMA_FIELDS, SCHEMA_TITLES, SCHEMA_DOCS, BUILDERS, validateSchema,
  type SchemaType, type FieldDef,
} from '../../lib/schema-validation';
import { SerpMock, EligibilityList } from './SerpPreview';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TYPE_ICON_PATHS: Record<SchemaType, string> = {
  Product:       '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
  FAQPage:       '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  LocalBusiness: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  Article:       '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
};

const TYPES: { type: SchemaType; richResult: string; description: string; features: string[] }[] = [
  {
    type: 'Product',
    richResult: 'Product rich result',
    description: 'Price, availability, and star ratings alongside your Google listing.',
    features: ['Price display', 'Star ratings', 'Stock status'],
  },
  {
    type: 'FAQPage',
    richResult: 'FAQ rich result',
    description: 'Expandable question-answer pairs that appear directly in search results.',
    features: ['Q&A dropdowns', 'More SERP space'],
  },
  {
    type: 'LocalBusiness',
    richResult: 'Local business result',
    description: 'Address, ratings, and phone number in local search and Google Maps.',
    features: ['Star ratings', 'Address display', 'Phone'],
  },
  {
    type: 'Article',
    richResult: 'Article rich result',
    description: 'Appear in Top Stories, Google News, and the Discover feed.',
    features: ['Top Stories', 'News carousel', 'Author credit'],
  },
];

// Pre-filled example values so the output is non-empty on first load
const EXAMPLES: Record<SchemaType, Record<string, string>> = {
  Product: {
    name: 'Classic Leather Wallet',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
    description: 'Handcrafted full-grain leather wallet with 6 card slots and a bill compartment.',
    sku: 'WALLET-BRN-001',
    brand: 'CraftCo',
    price: '49.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2026-12-31',
    ratingValue: '4.7',
    reviewCount: '128',
  },
  FAQPage: {
    q1: 'What is JSON-LD structured data?',
    a1: "JSON-LD is Google's recommended format for structured data. It's a JSON script block you add to your pages so search engines understand your content — product, article, FAQ, and more.",
    q2: 'Does structured data improve rankings?',
    a2: 'Not directly. It makes pages eligible for rich results — star ratings, FAQ dropdowns, product prices — which typically increase click-through rates from search.',
    q3: 'Is structured data required for SEO?',
    a3: "It's not required, but strongly recommended for any page that could qualify for a rich result. Product, FAQ, Article, and LocalBusiness pages see the most benefit.",
  },
  LocalBusiness: {
    name: 'The Corner Café',
    url: 'https://cornercafe.example.com',
    telephone: '+1-555-123-4567',
    streetAddress: '123 Main Street',
    addressLocality: 'Springfield',
    addressRegion: 'IL',
    postalCode: '62701',
    addressCountry: 'US',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    ratingValue: '4.5',
    reviewCount: '89',
  },
  Article: {
    headline: 'Getting Started with JSON-LD Structured Data',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
    datePublished: '2026-05-01',
    dateModified: '2026-05-10',
    authorName: 'Jane Smith',
    authorUrl: 'https://example.com/authors/jane',
    publisherName: 'Tech Blog',
    publisherLogo: 'https://example.com/logo.png',
    description: 'A practical guide to implementing JSON-LD structured data to unlock rich results in Google Search.',
  },
};

// Inline "why this matters" notes for key fields
const WHY: Partial<Record<SchemaType, Record<string, string>>> = {
  Product: {
    image: 'Required for Google to display any rich result. Min 50×50px.',
    price: 'Required together with currency. Missing either = no price in search.',
    priceCurrency: 'Required together with price.',
    availability: 'Adds "In stock" or "Out of stock" label in search results.',
    ratingValue: 'Adds star ratings. Highest visible CTR booster for product pages.',
    reviewCount: 'Required alongside rating — Google needs both to show stars.',
  },
  Article: {
    image: 'Required. Enables article cards in Google News and Discover.',
    datePublished: 'Required. Google shows publication date in search results.',
    authorName: 'Required. Establishes authorship and E-E-A-T signals.',
  },
  FAQPage: {
    q1: 'Each Q&A pair appears as an expandable dropdown directly in Google Search.',
  },
  LocalBusiness: {
    ratingValue: 'Adds star ratings in local search results and Google Maps.',
    telephone: 'Shown in the local knowledge panel and rich snippet.',
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypeCard({ config, onClick }: { config: typeof TYPES[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      class="group text-left w-full rounded-2xl border-2 border-gray-100 bg-white hover:border-yellow-400 p-5 sm:p-6 shadow-sm hover:shadow-md flex flex-col transition-[border-color,box-shadow,transform] duration-200 ease-out-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 focus:outline-none"
    >
      {/* Icon row */}
      <div class="flex items-start justify-between mb-5">
        <div class="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/70 group-hover:bg-yellow-50 group-hover:border-yellow-200 flex items-center justify-center transition-[background-color,border-color] duration-200 flex-shrink-0">
          <svg style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            class="text-gray-500 group-hover:text-yellow-700 transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: TYPE_ICON_PATHS[config.type] }} />
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all duration-200 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      </div>

      {/* Labels */}
      <p class="text-[10px] font-mono uppercase tracking-[0.14em] text-gray-400 mb-1">{SCHEMA_TITLES[config.type]}</p>
      <h3 class="text-[16px] font-bold text-black tracking-tight leading-snug mb-2.5">{config.richResult}</h3>
      <p class="text-[13px] text-gray-500 leading-[1.55] mb-5 flex-1">{config.description}</p>

      {/* Feature chips */}
      <div class="flex flex-wrap gap-1.5">
        {config.features.map(f => (
          <span class="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-yellow-50 group-hover:text-yellow-800 transition-colors duration-200">
            {f}
          </span>
        ))}
      </div>
    </button>
  );
}

function FieldRow({
  field, value, onChange, error, warning, why,
}: {
  field: FieldDef;
  value: string;
  onChange: (p: string, v: string) => void;
  error?: string;
  warning?: string;
  why?: string;
}) {
  const base = 'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150';
  const state = error
    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
    : warning
    ? 'border-yellow-300 bg-yellow-50/60 focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]'
    : 'border-gray-200 focus:border-yellow-400 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]';

  return (
    <div>
      <label class="block text-[13px] font-semibold text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span class="text-red-500 ml-1" title="Required">*</span>}
        {!field.required && field.recommended && <span class="text-[11px] font-medium text-yellow-700 ml-1.5 bg-yellow-50 border border-yellow-200 px-1.5 py-px rounded-full">rec.</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          class={`${base} ${state} min-h-[80px] resize-y`}
          value={value}
          placeholder={field.placeholder}
          onInput={(e) => onChange(field.property, (e.target as HTMLTextAreaElement).value)}
          rows={3}
        />
      ) : field.type === 'select' ? (
        <select class={`${base} ${state}`} value={value}
          onChange={(e) => onChange(field.property, (e.target as HTMLSelectElement).value)}>
          <option value="">— select —</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt.replace('https://schema.org/', '')}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === 'number' ? 'text' : field.type}
          class={`${base} ${state}`}
          value={value}
          placeholder={field.placeholder}
          onInput={(e) => onChange(field.property, (e.target as HTMLInputElement).value)}
        />
      )}
      {/* Why this matters — shown if defined and no error/warning */}
      {why && !error && !warning && (
        <p class="mt-1 text-[11px] text-yellow-700 leading-snug">{why}</p>
      )}
      {/* Format hint */}
      {field.hint && !error && !warning && !why && (
        <p class="mt-1 text-[11px] text-gray-500 leading-snug">{field.hint}</p>
      )}
      {field.hint && why && !error && !warning && (
        <p class="mt-0.5 text-[11px] text-gray-400 leading-snug">{field.hint}</p>
      )}
      {error && <p class="mt-1 text-[11px] text-red-600">{error}</p>}
      {warning && !error && <p class="mt-1 text-[11px] text-yellow-700">{warning}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SchemaGenerator({ initialType }: { initialType?: SchemaType }) {
  const [type, setType] = useState<SchemaType | null>(initialType ?? null);
  const [values, setValues] = useState<Record<string, string>>(
    initialType ? EXAMPLES[initialType] : {}
  );
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const [copyState, setCopyState] = useState<'idle' | 'json' | 'script'>('idle');
  const [validation, setValidation] = useState<ReturnType<typeof validateSchema> | null>(null);

  // Live validation whenever values change
  useEffect(() => {
    if (!type) return;
    setValidation(validateSchema(type, values));
  }, [type, values]);

  const handleTypeSelect = useCallback((t: SchemaType) => {
    setType(t);
    setValues(EXAMPLES[t]);
    setValidation(null);
    setActiveTab('preview');
  }, []);

  const handleChange = useCallback((property: string, value: string) => {
    setValues(prev => ({ ...prev, [property]: value }));
  }, []);

  const handleBack = useCallback(() => {
    setType(null);
    setValues({});
    setValidation(null);
  }, []);

  const copy = async (text: string, which: 'json' | 'script') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(which);
      setTimeout(() => setCopyState('idle'), 1800);
    } catch { /* clipboard blocked */ }
  };

  // Type picker
  if (!type) {
    return (
      <div>
        <p class="text-[13px] text-gray-500 mb-5">Which type of structured data do you need?</p>
        <div class="grid sm:grid-cols-2 gap-4">
          {TYPES.map(config => (
            <TypeCard key={config.type} config={config} onClick={() => handleTypeSelect(config.type)} />
          ))}
        </div>
        <p class="mt-5 text-[12px] text-gray-400">
          Type not listed?{' '}
          <a href="/schema-cheat-sheet/" class="underline text-gray-600 hover:text-black transition-colors duration-100">Browse the Schema.org cheat sheet</a>{' '}
          for copy-paste examples across 25 types.
        </p>
      </div>
    );
  }

  // Generator view
  const jsonLd = BUILDERS[type](values);
  const jsonString = JSON.stringify(jsonLd, null, 2);
  const scriptString = `<script type="application/ld+json">\n${jsonString}\n<\/script>`;
  const fields = SCHEMA_FIELDS[type];
  const required = fields.filter(f => f.required);
  const recommended = fields.filter(f => !f.required && f.recommended);
  const optional = fields.filter(f => !f.required && !f.recommended);
  const typeWhy = WHY[type] || {};

  const errorCount = validation?.errors.length || 0;
  const warnCount = validation?.warnings.length || 0;

  return (
    <div>
      {/* Header */}
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <button
            onClick={handleBack}
            class="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-black transition-colors duration-100 focus:outline-none focus-visible:text-black"
            aria-label="Back to type selection"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M10 3L5 8l5 5"/>
            </svg>
            Change type
          </button>
          <span class="text-gray-200" aria-hidden="true">·</span>
          <span class="text-[13px] font-semibold text-black">
            {SCHEMA_TITLES[type]} Schema
          </span>
          {validation && (
            <span class={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              errorCount > 0 ? 'bg-red-50 text-red-700' :
              warnCount > 0 ? 'bg-yellow-50 text-yellow-700' :
              'bg-green-50 text-green-700'
            }`}>
              {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` :
               warnCount > 0 ? `${warnCount} warning${warnCount > 1 ? 's' : ''}` :
               '✓ valid'}
            </span>
          )}
        </div>
        <a href={SCHEMA_DOCS[type]} target="_blank" rel="noopener"
          class="text-[11px] text-gray-400 hover:text-black no-underline underline underline-offset-2 transition-colors duration-100 hidden sm:block">
          Google docs ↗
        </a>
      </div>

      <div class="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">

        {/* Left: form */}
        <div class="space-y-7">
          {/* Required */}
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" aria-hidden="true"></span>
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">Required fields</span>
            </div>
            <div class="space-y-4">
              {required.map(field => (
                <FieldRow
                  key={field.property} field={field}
                  value={values[field.property] || ''}
                  onChange={handleChange}
                  error={validation?.errors.find(e => e.property === field.property)?.message}
                  warning={validation?.warnings.find(w => w.property === field.property)?.message}
                  why={typeWhy[field.property]}
                />
              ))}
            </div>
          </div>

          {/* Recommended */}
          {recommended.length > 0 && (
            <div>
              <div class="flex items-center gap-2 mb-4">
                <span class="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" aria-hidden="true"></span>
                <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-yellow-600">Recommended</span>
                <span class="text-[11px] text-gray-400">— improves rich result eligibility</span>
              </div>
              <div class="space-y-4">
                {recommended.map(field => (
                  <FieldRow
                    key={field.property} field={field}
                    value={values[field.property] || ''}
                    onChange={handleChange}
                    error={validation?.errors.find(e => e.property === field.property)?.message}
                    warning={validation?.warnings.find(w => w.property === field.property)?.message}
                    why={typeWhy[field.property]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <details class="group">
              <summary class="flex items-center gap-2 cursor-pointer list-none text-[12px] text-gray-500 hover:text-gray-800 transition-colors duration-100 select-none focus:outline-none">
                <svg class="w-3 h-3 transition-transform duration-200 group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
                Optional fields ({optional.length})
              </summary>
              <div class="mt-4 space-y-4 pl-1">
                {optional.map(field => (
                  <FieldRow
                    key={field.property} field={field}
                    value={values[field.property] || ''}
                    onChange={handleChange}
                    error={validation?.errors.find(e => e.property === field.property)?.message}
                    warning={validation?.warnings.find(w => w.property === field.property)?.message}
                  />
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Right: output panel */}
        <div class="lg:sticky lg:top-20">
          {/* Tabs */}
          <div class="flex gap-px bg-gray-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab('preview')}
              class={`flex-1 text-[13px] font-semibold py-2 px-3 rounded-lg transition-[background-color,color] duration-150 ${
                activeTab === 'preview' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SERP Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              class={`flex-1 text-[13px] font-semibold py-2 px-3 rounded-lg transition-[background-color,color] duration-150 ${
                activeTab === 'code' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              JSON-LD
            </button>
          </div>

          {/* Preview tab */}
          {activeTab === 'preview' && (
            <div class="space-y-5">
              <div class="overflow-x-auto">
                <SerpMock schema={jsonLd as Parameters<typeof SerpMock>[0]['schema']} />
              </div>
              <div class="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <EligibilityList schema={jsonLd as Parameters<typeof EligibilityList>[0]['schema']} />
              </div>
              <p class="text-[11px] text-gray-400 leading-relaxed">
                Preview shows what Google's docs say this type can display. Actual appearance varies by query and page signals.
                Always verify with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" class="underline text-gray-500 hover:text-black">Google Rich Results Test</a>.
              </p>
            </div>
          )}

          {/* Code tab */}
          {activeTab === 'code' && (
            <div class="space-y-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[12px] font-semibold text-gray-600 uppercase tracking-[0.1em]">Generated JSON-LD</span>
                <div class="flex gap-2">
                  <button
                    onClick={() => copy(jsonString, 'json')}
                    class={`text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-colors duration-150 ${
                      copyState === 'json' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {copyState === 'json' ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={() => copy(scriptString, 'script')}
                    class={`text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-colors duration-150 ${
                      copyState === 'script' ? 'bg-green-500 text-white' : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {copyState === 'script' ? 'Copied!' : 'Copy <script> Tag'}
                  </button>
                </div>
              </div>
              <pre class="bg-[#0d1117] text-[#7ee787] text-[11.5px] rounded-xl p-4 overflow-x-auto max-h-[420px] leading-relaxed whitespace-pre-wrap break-words border border-gray-800">{jsonString}</pre>

              <div class="space-y-2 pt-1">
                <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener"
                  class="flex items-center justify-between w-full bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/40 text-black px-4 py-3 rounded-xl text-[13px] font-semibold no-underline transition-[border-color,background-color] duration-150 group">
                  <span>Validate with Google Rich Results Test</span>
                  <span class="text-gray-400 group-hover:text-black">↗</span>
                </a>
                <p class="text-[11px] text-gray-400 px-1">Copy the JSON above → paste into the "Code snippet" tab.</p>
                <a href="https://validator.schema.org/" target="_blank" rel="noopener"
                  class="flex items-center justify-between w-full bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/40 text-black px-4 py-3 rounded-xl text-[13px] font-semibold no-underline transition-[border-color,background-color] duration-150 group">
                  <span>Validate with Schema.org Validator</span>
                  <span class="text-gray-400 group-hover:text-black">↗</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
