'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/env');
const logger = require('../config/logger');
const { assertPublicHost } = require('../utils/ssrfGuard');
const ConcurrencyLimiter = require('../utils/concurrencyLimiter');
const { TimeoutError, InternalError } = require('../utils/AppError');

const limiter = new ConcurrencyLimiter(config.audit.maxConcurrency);

const SECURITY_HEADER_KEYS = [
  'strict-transport-security',
  'content-security-policy',
  'x-content-type-options',
  'x-frame-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
];

/**
 * Performs the outbound fetch with a manual redirect chain so we can
 * (a) enforce a hard timeout, (b) count redirects, and (c) re-run the
 * SSRF host check on every hop, not just the initial URL.
 */
async function fetchWithRedirectTracking(initialUrl) {
  let currentUrl = initialUrl;
  let redirectCount = 0;
  const maxRedirects = config.audit.maxRedirects;
  const start = Date.now();

  // Loop is bounded by maxRedirects, so it cannot run away.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parsed = new URL(currentUrl);
    await assertPublicHost(parsed.hostname);

    let response;
    try {
      response = await axios.get(currentUrl, {
        timeout: config.audit.timeoutMs,
        maxRedirects: 0,
        validateStatus: () => true,
        headers: { 'User-Agent': 'PagePulse-Audit-Bot/1.0 (+https://digitalheroesco.com)' },
        responseType: 'text',
        transitional: { clarifyTimeoutError: true },
      });
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        throw new TimeoutError(`Request to ${currentUrl} timed out after ${config.audit.timeoutMs}ms`);
      }
      throw new InternalError(`Failed to reach ${currentUrl}: ${err.message}`);
    }

    const isRedirect = response.status >= 300 && response.status < 400 && response.headers.location;

    if (isRedirect && redirectCount < maxRedirects) {
      redirectCount += 1;
      currentUrl = new URL(response.headers.location, currentUrl).toString();
      continue;
    }

    return {
      response,
      finalUrl: currentUrl,
      redirectCount,
      responseTimeMs: Date.now() - start,
    };
  }
}

function extractSecurityHeaders(headers) {
  const found = {};
  for (const key of SECURITY_HEADER_KEYS) {
    if (headers[key]) found[key] = headers[key];
  }
  return found;
}

function extractMeta($, name) {
  return (
    $(`meta[name="${name}"]`).attr('content') ||
    $(`meta[property="${name}"]`).attr('content') ||
    null
  );
}

function extractFavicon($, baseUrl) {
  const iconHref =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href');

  if (!iconHref) return new URL('/favicon.ico', baseUrl).toString();
  try {
    return new URL(iconHref, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Parses the HTML body for the on-page SEO/meta signals we report on.
 */
function parseHtml(html, finalUrl) {
  const $ = cheerio.load(html);

  return {
    title: $('title').first().text().trim() || null,
    metaDescription: extractMeta($, 'description'),
    canonicalUrl: (() => {
      const href = $('link[rel="canonical"]').attr('href');
      if (!href) return null;
      try {
        return new URL(href, finalUrl).toString();
      } catch {
        return null;
      }
    })(),
    openGraph: {
      title: extractMeta($, 'og:title'),
      description: extractMeta($, 'og:description'),
    },
    robotsMeta: extractMeta($, 'robots'),
    favicon: extractFavicon($, finalUrl),
  };
}

/**
 * Runs a full audit against a single URL. This is the main entry
 * point used by the controller. Network concurrency is capped via
 * the shared limiter so a burst of requests can't starve the process.
 */
async function auditUrl(targetUrl) {
  return limiter.run(async () => {
    const { response, finalUrl, redirectCount, responseTimeMs } = await fetchWithRedirectTracking(targetUrl);

    const headers = response.headers || {};
    const contentType = headers['content-type'] || null;
    const isHtml = typeof contentType === 'string' && contentType.includes('text/html');
    const parsedUrl = new URL(finalUrl);

    const htmlSignals = isHtml
      ? parseHtml(typeof response.data === 'string' ? response.data : '', finalUrl)
      : {
          title: null,
          metaDescription: null,
          canonicalUrl: null,
          openGraph: { title: null, description: null },
          robotsMeta: null,
          favicon: null,
        };

    const contentLength = headers['content-length']
      ? parseInt(headers['content-length'], 10)
      : Buffer.byteLength(typeof response.data === 'string' ? response.data : '', 'utf8');

    return {
      requestedUrl: targetUrl,
      finalUrl,
      statusCode: response.status,
      https: parsedUrl.protocol === 'https:',
      redirectCount,
      responseTimeMs,
      contentType,
      contentLength,
      serverHeader: headers.server || null,
      cacheControl: headers['cache-control'] || null,
      hsts: headers['strict-transport-security'] || null,
      securityHeaders: extractSecurityHeaders(headers),
      seo: htmlSignals,
      headers: {
        // Only expose a curated, non-sensitive subset of raw headers.
        server: headers.server || null,
        'content-type': headers['content-type'] || null,
        'cache-control': headers['cache-control'] || null,
        'content-length': headers['content-length'] || null,
      },
      auditedAt: new Date().toISOString(),
    };
  });
}

module.exports = { auditUrl, limiter };
