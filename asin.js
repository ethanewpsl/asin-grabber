// Explicit marketplace domains prevent matching lookalike sites.
const marketplaces = new Set([
  'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.com.mx', 'amazon.com.br',
  'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.nl', 'amazon.se',
  'amazon.pl', 'amazon.com.be', 'amazon.ie', 'amazon.co.jp', 'amazon.in',
  'amazon.com.au', 'amazon.sg', 'amazon.ae', 'amazon.sa', 'amazon.eg',
  'amazon.com.tr', 'amazon.co.za', 'amazon.cn'
]);

export function extractAsin(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  if (![...marketplaces].some(domain => host === domain || host.endsWith(`.${domain}`))) return null;
  const match = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d|product)\/([a-z0-9]{10})(?:\/|$)/i);
  if (match) return match[1].toUpperCase();
  for (const [key, value] of url.searchParams) {
    if (key.toLowerCase() === 'asin' && /^[a-z0-9]{10}$/i.test(value)) return value.toUpperCase();
  }
  return null;
}
