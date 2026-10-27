const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1";

/** Live marketing site with production /terms, /privacy, /contact. */
const LIVE_WEBSITE_ORIGIN = "https://swaroop-website-mocha.vercel.app";
const BROKEN_WEBSITE_HOSTS = new Set([
  "petrotrade.in",
  "www.petrotrade.in",
  "swaroop-website.vercel.app",
]);
const LIVE_TERMS_URL = `${LIVE_WEBSITE_ORIGIN}/terms`;
const LIVE_PRIVACY_URL = `${LIVE_WEBSITE_ORIGIN}/privacy`;
const LIVE_SUPPORT_URL = `${LIVE_WEBSITE_ORIGIN}/contact`;

export type LegalLinks = {
  websiteUrl: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportUrl: string | null;
  supportEmail: string | null;
  missing: string[];
};

export type ContactSupportOptions = {
  /** Pre-select topic on the marketing /contact form (e.g. SELL_MATERIALS). */
  topic?: string;
};

let cached: LegalLinks | null = null;
let inflight: Promise<LegalLinks> | null = null;

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function resolvePublicWebsiteUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (BROKEN_WEBSITE_HOSTS.has(parsed.hostname.toLowerCase())) {
      const live = new URL(LIVE_WEBSITE_ORIGIN);
      parsed.protocol = live.protocol;
      parsed.host = live.host;
      return parsed.toString();
    }
    return url;
  } catch {
    return null;
  }
}

function withTopic(url: string, topic?: string): string {
  if (!topic) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("topic")) {
      parsed.searchParams.set("topic", topic);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function fetchLegalLinks(): Promise<LegalLinks> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(
        `${apiBaseUrl.replace(/\/$/, "")}/public/legal-links`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { data?: LegalLinks };
      const data = body.data;
      if (!data) throw new Error("Missing legal links payload");
      cached = {
        websiteUrl:
          resolvePublicWebsiteUrl(data.websiteUrl) ?? LIVE_WEBSITE_ORIGIN,
        termsUrl: resolvePublicWebsiteUrl(data.termsUrl) ?? LIVE_TERMS_URL,
        privacyUrl:
          resolvePublicWebsiteUrl(data.privacyUrl) ?? LIVE_PRIVACY_URL,
        supportUrl:
          resolvePublicWebsiteUrl(data.supportUrl) ?? LIVE_SUPPORT_URL,
        supportEmail: data.supportEmail ?? null,
        missing: Array.isArray(data.missing) ? data.missing : [],
      };
      return cached;
    } catch {
      return {
        websiteUrl: LIVE_WEBSITE_ORIGIN,
        termsUrl: LIVE_TERMS_URL,
        privacyUrl: LIVE_PRIVACY_URL,
        supportUrl: LIVE_SUPPORT_URL,
        supportEmail: null,
        missing: [],
      };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function openBlank(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function openTermsOfService(): Promise<void> {
  const links = await fetchLegalLinks();
  openBlank(isHttpUrl(links.termsUrl) ? links.termsUrl : LIVE_TERMS_URL);
}

export async function openPrivacyPolicy(): Promise<void> {
  const links = await fetchLegalLinks();
  openBlank(isHttpUrl(links.privacyUrl) ? links.privacyUrl : LIVE_PRIVACY_URL);
}

export async function openContactSupport(
  options?: ContactSupportOptions,
): Promise<void> {
  const links = await fetchLegalLinks();
  if (isHttpUrl(links.supportUrl)) {
    openBlank(withTopic(links.supportUrl, options?.topic));
    return;
  }
  if (links.supportEmail) {
    window.location.href = `mailto:${links.supportEmail}`;
    return;
  }
  openBlank(withTopic(LIVE_SUPPORT_URL, options?.topic));
}
