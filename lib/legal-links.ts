const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1";

export type LegalLinks = {
  websiteUrl: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportUrl: string | null;
  supportEmail: string | null;
  missing: string[];
};

const EMPTY: LegalLinks = {
  websiteUrl: null,
  termsUrl: null,
  privacyUrl: null,
  supportUrl: null,
  supportEmail: null,
  missing: [
    "PUBLIC_TERMS_URL (or PUBLIC_WEBSITE_URL)",
    "PUBLIC_PRIVACY_URL (or PUBLIC_WEBSITE_URL)",
    "PUBLIC_SUPPORT_URL / PUBLIC_SUPPORT_EMAIL (or PUBLIC_WEBSITE_URL)",
  ],
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
        websiteUrl: data.websiteUrl ?? null,
        termsUrl: data.termsUrl ?? null,
        privacyUrl: data.privacyUrl ?? null,
        supportUrl: data.supportUrl ?? null,
        supportEmail: data.supportEmail ?? null,
        missing: Array.isArray(data.missing) ? data.missing : [],
      };
      return cached;
    } catch {
      return EMPTY;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function openBlank(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function missingToast(label: string, keys: string[]) {
  const detail =
    keys.length > 0
      ? `Missing configuration: ${keys.join(", ")}`
      : "Ask an admin to set the public legal URL in the backend environment.";
  // toast may not be imported everywhere — window.alert is explicit for config gaps.
  window.alert(`${label} is not configured.\n\n${detail}`);
}

export async function openTermsOfService(): Promise<void> {
  const links = await fetchLegalLinks();
  if (!isHttpUrl(links.termsUrl)) {
    missingToast(
      "Terms of Service",
      links.missing.filter((k) => k.includes("TERMS") || k.includes("WEBSITE")),
    );
    return;
  }
  openBlank(links.termsUrl);
}

export async function openPrivacyPolicy(): Promise<void> {
  const links = await fetchLegalLinks();
  if (!isHttpUrl(links.privacyUrl)) {
    missingToast(
      "Privacy Policy",
      links.missing.filter(
        (k) => k.includes("PRIVACY") || k.includes("WEBSITE"),
      ),
    );
    return;
  }
  openBlank(links.privacyUrl);
}

export async function openContactSupport(): Promise<void> {
  const links = await fetchLegalLinks();
  if (isHttpUrl(links.supportUrl)) {
    openBlank(links.supportUrl);
    return;
  }
  if (links.supportEmail) {
    window.location.href = `mailto:${links.supportEmail}`;
    return;
  }
  missingToast(
    "Contact Support",
    links.missing.filter((k) => k.includes("SUPPORT") || k.includes("WEBSITE")),
  );
}
