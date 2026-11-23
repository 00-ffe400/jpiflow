const currencies = ["KRW", "USD"];
const units = {
  QUANTITY_UNIT_IMAGE: "image",
  QUANTITY_UNIT_BODY_PART: "bodyPart",
  QUANTITY_UNIT_SERIES: "series",
  QUANTITY_UNIT_STUDY: "study",
};
const validAmount = (value, currency) =>
  typeof value === "string" &&
  (currency === "KRW" ? /^\d{1,12}$/ : /^\d{1,12}(?:\.\d{1,2})?$/).test(value);

function normalizeRates(data, currency) {
  if (
    data?.currency !== currency ||
    !Array.isArray(data.modalityPrices) ||
    !data.modalityPrices.length
  )
    return null;
  const rates = data.modalityPrices.map((item) => {
    if (
      !item ||
      !/^[A-Z0-9]{1,12}$/.test(item.modality) ||
      !Object.hasOwn(units, item.quantityUnit) ||
      !validAmount(item.firstUnitRate, currency) ||
      !validAmount(item.additionalUnitRate, currency)
    )
      return null;
    return {
      modality: item.modality,
      unit: units[item.quantityUnit],
      first: item.firstUnitRate,
      additional: item.additionalUnitRate,
    };
  });
  return rates.every(Boolean) ? rates : null;
}

function normalizePackages(data, currency) {
  if (!Array.isArray(data) || !data.length) return null;
  const packages = data.map((item) => {
    if (!item) return null;
    const amounts = [item.payAmount, item.bonusAmount, item.creditAmount];
    if (
      !amounts.every(
        (value) => value?.currency === currency && validAmount(value.amount, currency),
      ) ||
      typeof item.bonusPercent !== "string" ||
      !/^\d{1,3}(?:\.\d{1,4})?$/.test(item.bonusPercent)
    )
      return null;
    return {
      pay: amounts[0].amount,
      bonus: amounts[1].amount,
      credit: amounts[2].amount,
      bonusPercent: item.bonusPercent,
    };
  });
  return packages.every(Boolean) ? packages : null;
}

// Fetch only anonymous, published prices. A missing or invalid response stays unavailable.
export async function loadPublishedPrices(origin) {
  const base = new URL(origin);
  if (base.username || base.password || !["http:", "https:"].includes(base.protocol))
    throw new Error("Invalid landing origin");
  async function get(path, currency) {
    const url = new URL(`/api/trpc/${path}`, base);
    url.searchParams.set("input", JSON.stringify({ currency }));
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: "error" });
    if (!response.ok) throw new Error(`Published ${path} unavailable (${response.status})`);
    const result = await response.json();
    if (!result?.result || !("data" in result.result)) throw new Error(`Invalid ${path} response`);
    return result.result.data;
  }
  const entries = await Promise.all(
    currencies.map(async (currency) => {
      const [rates, packages] = await Promise.allSettled([
        get("pricing.getScheduleV2", currency),
        get("topUp.packages", currency),
      ]);
      return [
        currency,
        {
          rates: rates.status === "fulfilled" ? normalizeRates(rates.value, currency) : null,
          packages:
            packages.status === "fulfilled" ? normalizePackages(packages.value, currency) : null,
        },
      ];
    }),
  );
  return { asOf: new Date().toISOString(), ...Object.fromEntries(entries) };
}
