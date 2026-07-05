export type SkyscannerParams = {
  from: string; // IATA code e.g. "ACC"
  to: string; // IATA code e.g. "LHR"
  outDate: string; // YYYY-MM-DD
  inDate?: string; // YYYY-MM-DD (for return)
  passengers?: number;
};

/** Builds a Skyscanner flight search deep-link. Date format: YYMMDD. */
export function buildSkyscannerUrl(p: SkyscannerParams): string {
  const fmt = (d: string) => d.replace(/-/g, "").slice(2); // YYYY-MM-DD → YYMMDD
  const from = p.from.trim().toUpperCase();
  const to = p.to.trim().toUpperCase();
  const out = fmt(p.outDate);
  const ret = p.inDate ? fmt(p.inDate) : undefined;
  const adults = Math.max(1, Math.min(9, p.passengers ?? 1));

  let url = `https://www.skyscanner.net/transport/flights/${from}/${to}/${out}/`;
  if (ret) url += `${ret}/`;
  url += `?adults=${adults}&currency=GHS`;
  return url;
}

export type BookingParams = {
  destination: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  guests?: number;
};

/** Builds a Booking.com hotel search deep-link. */
export function buildBookingUrl(p: BookingParams): string {
  const guests = Math.max(1, Math.min(9, p.guests ?? 1));
  const params = new URLSearchParams({
    ss: p.destination.trim(),
    checkin: p.checkin,
    checkout: p.checkout,
    group_adults: String(guests),
    no_rooms: "1",
    selected_currency: "GHS",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
