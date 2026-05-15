import { useState } from 'preact/hooks';

export type SerpSchema = { '@type': string | string[]; [key: string]: unknown };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function str(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'name' in v)
    return (v as Record<string, unknown>).name as string;
  return String(v);
}

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.round(value);
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < full ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SERP mock renderers
// ---------------------------------------------------------------------------

function ProductMock({ s }: { s: SerpSchema }) {
  const offer = (s.offers as Record<string, unknown>) || {};
  const agg = (s.aggregateRating as Record<string, unknown>) || {};
  const price = offer.price as string | undefined;
  const currency = (offer.priceCurrency as string) || 'USD';
  const avail = ((offer.availability as string) || '').replace('https://schema.org/', '');
  const rating = agg.ratingValue ? parseFloat(agg.ratingValue as string) : null;
  const count = agg.reviewCount || agg.ratingCount;
  const img = typeof s.image === 'string' ? s.image
    : Array.isArray(s.image) ? s.image[0] : null;

  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, maxWidth: 580 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {img && (
          <img src={img} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#4d5156', marginBottom: 3 }}>yoursite.com › products</div>
          <div style={{ fontSize: 18, color: '#1a0dab', lineHeight: 1.3, marginBottom: 5 }}>{str(s.name) || 'Product Name'}</div>
          {price && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#202124' }}>{currency} {price}</span>
              {avail === 'InStock' && <span style={{ fontSize: 12, color: '#0d652d', background: '#e6f4ea', borderRadius: 4, padding: '2px 7px' }}>In stock</span>}
              {avail === 'OutOfStock' && <span style={{ fontSize: 12, color: '#c5221f', background: '#fce8e6', borderRadius: 4, padding: '2px 7px' }}>Out of stock</span>}
              {avail === 'PreOrder' && <span style={{ fontSize: 12, color: '#1558d6', background: '#e8f0fe', borderRadius: 4, padding: '2px 7px' }}>Pre-order</span>}
            </div>
          )}
          {rating !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: '#202124' }}>{rating.toFixed(1)}</span>
              <Stars value={rating} />
              {count && <span style={{ color: '#70757a' }}>({count})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqMock({ s }: { s: SerpSchema }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = ((s.mainEntity as unknown[]) || []).slice(0, 4);
  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, maxWidth: 580 }}>
      <div style={{ fontSize: 11, color: '#4d5156', marginBottom: 3 }}>yoursite.com</div>
      <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 10 }}>Your page title</div>
      {items.length === 0 && (
        <div style={{ color: '#9ca3af', fontSize: 13, padding: '8px 0' }}>
          Add at least one question and answer to preview the FAQ rich result.
        </div>
      )}
      {items.map((item: unknown, i: number) => {
        const q = item as Record<string, unknown>;
        const ans = (q.acceptedAnswer as Record<string, unknown>)?.text as string || '';
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
            <button onClick={() => setOpen(isOpen ? null : i)}
              style={{ width: '100%', textAlign: 'left', padding: '11px 4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, color: '#202124' }}>
              <span>{str(q.name)}</span>
              <span style={{ fontSize: 16, color: '#70757a', flexShrink: 0, marginLeft: 8 }}>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && <div style={{ padding: '2px 4px 12px', fontSize: 14, color: '#4d5156', lineHeight: 1.55 }}>{ans}</div>}
          </div>
        );
      })}
    </div>
  );
}

function ArticleMock({ s }: { s: SerpSchema }) {
  const publisher = str((s.publisher as Record<string, unknown>)?.name) || 'Publisher';
  const img = typeof s.image === 'string' ? s.image
    : Array.isArray(s.image) ? s.image[0]
    : typeof s.image === 'object' && s.image ? (s.image as Record<string, string>).url
    : null;
  const date = s.datePublished
    ? new Date(s.datePublished as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', maxWidth: 360 }}>
      {img && <img src={img} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: '#4d5156', fontWeight: 600 }}>{publisher}</span>
          {date && <span style={{ fontSize: 12, color: '#70757a' }}>· {date}</span>}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#202124', lineHeight: 1.4 }}>
          {str(s.headline) || 'Article Headline'}
        </div>
      </div>
    </div>
  );
}

function LocalBusinessMock({ s }: { s: SerpSchema }) {
  const addr = (s.address as Record<string, unknown>) || {};
  const addrStr = [str(addr.streetAddress), str(addr.addressLocality), str(addr.addressRegion)].filter(Boolean).join(', ');
  const agg = (s.aggregateRating as Record<string, unknown>) || {};
  const rating = agg.ratingValue ? parseFloat(agg.ratingValue as string) : null;
  const count = agg.reviewCount;
  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, maxWidth: 580 }}>
      <div style={{ fontSize: 11, color: '#4d5156', marginBottom: 3 }}>yoursite.com</div>
      <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 5 }}>{str(s.name) || 'Business Name'}</div>
      {rating !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: '#202124' }}>{rating.toFixed(1)}</span>
          <Stars value={rating} />
          {count && <span style={{ color: '#70757a' }}>({count} reviews)</span>}
        </div>
      )}
      {addrStr && <div style={{ fontSize: 13, color: '#4d5156' }}>{addrStr}</div>}
      {s.telephone && <div style={{ fontSize: 13, color: '#4d5156', marginTop: 3 }}>{str(s.telephone)}</div>}
    </div>
  );
}

function RecipeMock({ s }: { s: SerpSchema }) {
  const agg = (s.aggregateRating as Record<string, unknown>) || {};
  const rating = agg.ratingValue ? parseFloat(agg.ratingValue as string) : null;
  const count = agg.reviewCount || agg.ratingCount;
  const img = typeof s.image === 'string' ? s.image : Array.isArray(s.image) ? s.image[0] : null;
  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', maxWidth: 360 }}>
      {img && <img src={img} alt="" style={{ width: '100%', height: 170, objectFit: 'cover' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#202124', marginBottom: 6 }}>{str(s.name) || 'Recipe Name'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: '#70757a' }}>
          {s.totalTime && <span>{(s.totalTime as string).replace('PT', '').replace('M', ' min').replace('H', ' hr ').trim()}</span>}
          {s.recipeYield && <span>{str(s.recipeYield)}</span>}
          {rating !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Stars value={rating} /> {rating.toFixed(1)} {count && `(${count})`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventMock({ s }: { s: SerpSchema }) {
  const loc = (s.location as Record<string, unknown>) || {};
  const addr = (loc.address as Record<string, unknown>) || {};
  const locStr = [str(loc.name), str(addr.addressLocality), str(addr.addressCountry)].filter(Boolean).join(', ');
  const startDate = s.startDate
    ? new Date(s.startDate as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return (
    <div style={{ fontFamily: 'arial,sans-serif', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, maxWidth: 580 }}>
      <div style={{ fontSize: 11, color: '#4d5156', marginBottom: 3 }}>yoursite.com</div>
      <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 7 }}>{str(s.name) || 'Event Name'}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#4d5156' }}>
        {startDate && <span>{startDate}</span>}
        {locStr && <span>{locStr}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eligibility checks
// ---------------------------------------------------------------------------

export interface Check { label: string; pass: boolean; note?: string }

function checksProduct(s: SerpSchema): Check[] {
  const offer = (s.offers as Record<string, unknown>) || {};
  const agg = (s.aggregateRating as Record<string, unknown>) || {};
  return [
    { label: 'name', pass: !!s.name, note: 'Required' },
    { label: 'image', pass: !!s.image, note: 'Required' },
    { label: 'offers.price', pass: !!offer.price, note: 'Required for price display' },
    { label: 'offers.priceCurrency', pass: !!offer.priceCurrency, note: 'Required for price display' },
    { label: 'offers.availability', pass: !!offer.availability, note: 'Recommended' },
    { label: 'aggregateRating', pass: !!(agg.ratingValue && agg.reviewCount), note: 'Enables star ratings' },
  ];
}
function checksFaq(s: SerpSchema): Check[] {
  const items = (s.mainEntity as unknown[]) || [];
  return [
    { label: 'mainEntity', pass: items.length >= 1, note: 'At least 1 Q&A required' },
    { label: 'all answers present', pass: items.length > 0 && items.every((q: unknown) => {
      const o = q as Record<string, unknown>;
      return o?.name && (o?.acceptedAnswer as Record<string, unknown>)?.text;
    }), note: 'Every question needs an answer' },
  ];
}
function checksArticle(s: SerpSchema): Check[] {
  return [
    { label: 'headline', pass: !!s.headline, note: 'Required' },
    { label: 'image', pass: !!s.image, note: 'Required' },
    { label: 'datePublished', pass: !!s.datePublished, note: 'Required' },
    { label: 'author', pass: !!s.author, note: 'Required' },
    { label: 'publisher', pass: !!s.publisher, note: 'Recommended' },
  ];
}
function checksLocalBusiness(s: SerpSchema): Check[] {
  const addr = (s.address as Record<string, unknown>) || {};
  return [
    { label: 'name', pass: !!s.name, note: 'Required' },
    { label: 'address', pass: !!(addr.streetAddress || addr.addressLocality), note: 'Required' },
    { label: 'telephone', pass: !!s.telephone, note: 'Recommended' },
    { label: 'aggregateRating', pass: !!s.aggregateRating, note: 'Enables star ratings' },
  ];
}
function checksRecipe(s: SerpSchema): Check[] {
  return [
    { label: 'name', pass: !!s.name, note: 'Required' },
    { label: 'image', pass: !!s.image, note: 'Required' },
    { label: 'author', pass: !!s.author, note: 'Required' },
    { label: 'recipeIngredient', pass: !!s.recipeIngredient, note: 'Recommended' },
    { label: 'recipeInstructions', pass: !!s.recipeInstructions, note: 'Recommended' },
    { label: 'totalTime', pass: !!s.totalTime, note: 'Enables time display' },
  ];
}
function checksEvent(s: SerpSchema): Check[] {
  return [
    { label: 'name', pass: !!s.name, note: 'Required' },
    { label: 'startDate', pass: !!s.startDate, note: 'Required' },
    { label: 'location', pass: !!s.location, note: 'Required' },
    { label: 'offers', pass: !!s.offers, note: 'Enables ticket link' },
  ];
}

// ---------------------------------------------------------------------------
// Type routing
// ---------------------------------------------------------------------------

// Components (not plain functions) so hooks inside work and JSX call is correct
const MOCKS: Record<string, (props: { s: SerpSchema }) => JSX.Element> = {
  Product: ({ s }) => <ProductMock s={s} />,
  FAQPage: ({ s }) => <FaqMock s={s} />,
  Recipe: ({ s }) => <RecipeMock s={s} />,
  Article: ({ s }) => <ArticleMock s={s} />,
  BlogPosting: ({ s }) => <ArticleMock s={s} />,
  NewsArticle: ({ s }) => <ArticleMock s={s} />,
  Event: ({ s }) => <EventMock s={s} />,
  LocalBusiness: ({ s }) => <LocalBusinessMock s={s} />,
};

const CHECKS: Record<string, (s: SerpSchema) => Check[]> = {
  Product: checksProduct,
  FAQPage: checksFaq,
  Recipe: checksRecipe,
  Article: checksArticle,
  BlogPosting: checksArticle,
  NewsArticle: checksArticle,
  Event: checksEvent,
  LocalBusiness: checksLocalBusiness,
};

export const SUPPORTED_TYPES = Object.keys(MOCKS);

export function getPrimaryType(schema: SerpSchema): string {
  const t = schema['@type'];
  const types = Array.isArray(t) ? t : t ? [t] : [];
  return types.find(t => MOCKS[t]) || types[0] || '';
}

// ---------------------------------------------------------------------------
// Exported components
// ---------------------------------------------------------------------------

export function SerpMock({ schema }: { schema: SerpSchema }) {
  const type = getPrimaryType(schema);
  const Render = MOCKS[type];
  if (!Render) return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af', fontSize: 13 }}>
      No preview for <code style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{type || 'unknown type'}</code>.
      <br />Supported: {SUPPORTED_TYPES.join(', ')}.
    </div>
  );
  return <Render s={schema} />;
}

export function EligibilityList({ schema }: { schema: SerpSchema }) {
  const type = getPrimaryType(schema);
  const checker = CHECKS[type];
  if (!checker) return null;
  const checks = checker(schema);
  const passes = checks.filter(c => c.pass).length;
  const allPass = passes === checks.length;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Eligibility</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
          background: allPass ? '#dcfce7' : '#fef9c3',
          color: allPass ? '#15803d' : '#92400e',
        }}>
          {passes}/{checks.length} pass
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
            <span style={{ color: c.pass ? '#16a34a' : '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 11 }}>
              {c.pass ? '✓' : '✗'}
            </span>
            <span>
              <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '0 4px', borderRadius: 3 }}>{c.label}</code>
              {c.note && <span style={{ color: '#6b7280', marginLeft: 5 }}>— {c.note}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
