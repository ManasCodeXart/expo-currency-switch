// providers/frankfurter.ts

import type { ExchangeRateFetcher } from "../constants/types";

const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v1/latest";

/**
 * Default rate provider — no API key required, sourced from ECB + partner
 * central banks. Suitable for client-only apps since it needs no secret.
 * For production apps where rate accuracy affects money movement, proxy
 * through your own backend instead of calling this directly from the client.
 */
export const fetchFrankfurterRate: ExchangeRateFetcher = async (base, target) => {
  const url = `${FRANKFURTER_RATES_URL}?base=${base}&symbols=${target}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Frankfurter request failed (${response.status})`);
  }

  const data = await response.json();
  const rate = data?.rates?.[target];

  if (typeof rate !== "number") {
    throw new Error(`Frankfurter returned no rate for ${base} → ${target}`);
  }

  return rate;
};