const SITE_TAG = '3f685f1f9c414ddf9bc305d40837a924';

const HEADERS_OK = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, max-age=300',
};

const HEADERS_ERR = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export async function onRequestGet({ env }) {
  const { CF_ACCOUNT_TAG, CF_API_TOKEN } = env;
  if (!CF_ACCOUNT_TAG || !CF_API_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'Analytics is not configured (missing CF_ACCOUNT_TAG or CF_API_TOKEN).' }),
      { status: 500, headers: HEADERS_ERR }
    );
  }

  try {
    const result = await fetchStats(CF_ACCOUNT_TAG, CF_API_TOKEN);
    return new Response(JSON.stringify(result), { headers: HEADERS_OK });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to fetch analytics' }),
      { status: 502, headers: HEADERS_ERR }
    );
  }
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchStats(accountTag, apiToken) {
  if (!/^[0-9a-f]{32}$/i.test(accountTag)) {
    throw new Error('Invalid CF_ACCOUNT_TAG format');
  }

  const now = new Date();
  const minus1h = new Date(now - 60 * 60 * 1000).toISOString();
  const minus24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const yesterday = toDateStr(new Date(now - 24 * 60 * 60 * 1000));
  const minus30d = toDateStr(new Date(now - 30 * 24 * 60 * 60 * 1000));

  const query = `{
    viewer {
      accounts(filter: { accountTag: "${accountTag}" }) {
        last1h: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", datetime_geq: "${minus1h}" }
          limit: 1
        ) { sum { visits } count }
        last24h: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", datetime_geq: "${minus24h}" }
          limit: 1
        ) { sum { visits } count }
        last30d: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}" }
          limit: 1
        ) { sum { visits } count }
        daily: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}", date_leq: "${yesterday}" }
          orderBy: [date_ASC]
          limit: 30
        ) { dimensions { date } sum { visits } count }
        topPages: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}" }
          orderBy: [sum_visits_DESC]
          limit: 10
        ) { dimensions { requestPath } sum { visits } count }
        topCountries: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}" }
          orderBy: [sum_visits_DESC]
          limit: 10
        ) { dimensions { countryName } sum { visits } }
        topReferrers: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}" }
          orderBy: [sum_visits_DESC]
          limit: 10
        ) { dimensions { refererHost } sum { visits } }
        topDevices: rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: "${SITE_TAG}", date_geq: "${minus30d}" }
          orderBy: [sum_visits_DESC]
          limit: 5
        ) { dimensions { deviceType } sum { visits } }
      }
    }
  }`;

  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  const account = json.data?.viewer?.accounts?.[0];
  if (!account) {
    throw new Error('No account data returned, check CF_ACCOUNT_TAG');
  }

  return {
    visits_1h: account.last1h?.[0]?.sum?.visits ?? 0,
    pageviews_1h: account.last1h?.[0]?.count ?? 0,
    visits_24h: account.last24h?.[0]?.sum?.visits ?? 0,
    pageviews_24h: account.last24h?.[0]?.count ?? 0,
    visits_30d: account.last30d?.[0]?.sum?.visits ?? 0,
    pageviews_30d: account.last30d?.[0]?.count ?? 0,
    daily: (account.daily || []).map((e) => ({
      date: e.dimensions.date,
      visits: e.sum?.visits ?? 0,
      pageviews: e.count ?? 0,
    })),
    topPages: (account.topPages || []).map((e) => ({
      path: e.dimensions.requestPath,
      visits: e.sum?.visits ?? 0,
      pageviews: e.count ?? 0,
    })),
    topCountries: (account.topCountries || []).map((e) => ({
      country: e.dimensions.countryName || 'Unknown',
      visits: e.sum?.visits ?? 0,
    })),
    topReferrers: (account.topReferrers || []).map((e) => ({
      referrer: e.dimensions.refererHost || 'Direct',
      visits: e.sum?.visits ?? 0,
    })),
    topDevices: (account.topDevices || []).map((e) => ({
      device: e.dimensions.deviceType || 'Unknown',
      visits: e.sum?.visits ?? 0,
    })),
    generated_at: now.toISOString(),
  };
}
