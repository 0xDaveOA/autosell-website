/** Shared filter / form values for browse and sell flows (must match DB `eq()` on /cars). */
export const TRANSMISSION_OPTIONS = ["Automatic", "Manual", "CVT", "Other"] as const;

export const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG", "Other"] as const;
