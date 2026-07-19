export type SearchDraft = {
  vertical: "cars" | "rentals";
  make?: string;
  maxPrice?: number;
};

export type AssistantChip = {
  label: string;
  /** id of the next node to show */
  next?: string;
  /** internal page link — navigates and closes the panel */
  href?: string;
  /** message passed to waLink() — opens WhatsApp in a new tab */
  wa?: string;
  /** merge into the current search draft */
  patch?: Partial<SearchDraft>;
  /** fire GET /api/assistant/search with the current draft */
  action?: "search";
};

export type AssistantNode = {
  id: string;
  /** bot bubbles shown when this node is entered */
  bot: string[];
  /** page-link buttons rendered under the bubbles */
  links?: { label: string; href: string }[];
  chips: AssistantChip[];
};

export const ROOT_NODE = "root";

const HUMAN_CHIP: AssistantChip = {
  label: "📞 Talk to a human",
  wa: "Hi AutoSell Ghana! I have a question about your site.",
};

const MENU_CHIP: AssistantChip = { label: "↩ Main menu", next: ROOT_NODE };

export const FLOWS: Record<string, AssistantNode> = {
  root: {
    id: "root",
    bot: [
      "👋 Akwaaba! I'm the AutoSell assistant.",
      "What can I help you with today?",
    ],
    chips: [
      { label: "🚗 Buy a car", next: "buy-make" },
      { label: "💰 Sell my car", next: "sell" },
      { label: "🔑 Rent a car", next: "rent-budget", patch: { vertical: "rentals" } },
      { label: "✈️ Flights", next: "flights" },
      { label: "🏨 Hotels", next: "hotels" },
      { label: "💳 Pricing", next: "pricing" },
      HUMAN_CHIP,
    ],
  },

  "buy-make": {
    id: "buy-make",
    bot: ["Great — let's find you a car! 🚗", "Which make are you interested in?"],
    chips: [
      { label: "Toyota", next: "buy-budget", patch: { vertical: "cars", make: "Toyota" } },
      { label: "Honda", next: "buy-budget", patch: { vertical: "cars", make: "Honda" } },
      { label: "Hyundai", next: "buy-budget", patch: { vertical: "cars", make: "Hyundai" } },
      { label: "Mercedes-Benz", next: "buy-budget", patch: { vertical: "cars", make: "Mercedes-Benz" } },
      { label: "Kia", next: "buy-budget", patch: { vertical: "cars", make: "Kia" } },
      { label: "Any make", next: "buy-budget", patch: { vertical: "cars", make: undefined } },
      MENU_CHIP,
    ],
  },

  "buy-budget": {
    id: "buy-budget",
    bot: ["And what's your budget?"],
    chips: [
      { label: "Under ₵50,000", patch: { maxPrice: 50000 }, action: "search" },
      { label: "Under ₵100,000", patch: { maxPrice: 100000 }, action: "search" },
      { label: "Under ₵200,000", patch: { maxPrice: 200000 }, action: "search" },
      { label: "Any budget", patch: { maxPrice: undefined }, action: "search" },
      MENU_CHIP,
    ],
  },

  "rent-budget": {
    id: "rent-budget",
    bot: [
      "Nice — rentals it is! 🔑",
      "Our partners offer daily rentals and long-term leases, with or without a driver.",
      "What daily budget are you thinking?",
    ],
    chips: [
      { label: "Under ₵500/day", patch: { vertical: "rentals", maxPrice: 500 }, action: "search" },
      { label: "Under ₵1,000/day", patch: { vertical: "rentals", maxPrice: 1000 }, action: "search" },
      { label: "Any rate", patch: { vertical: "rentals", maxPrice: undefined }, action: "search" },
      MENU_CHIP,
    ],
  },

  sell: {
    id: "sell",
    bot: [
      "Selling your car on AutoSell is easy — and listing is 100% FREE. 💰",
      "Fill the quick form with your car details and photos. Once approved, buyers contact you through our WhatsApp, and we even promote listings on Facebook & Instagram.",
    ],
    links: [
      { label: "List my car — free", href: "/sell" },
      { label: "See pricing packages", href: "/#pricing" },
    ],
    chips: [MENU_CHIP, HUMAN_CHIP],
  },

  flights: {
    id: "flights",
    bot: [
      "✈️ We search live flight prices from Ghana to anywhere in the world — powered by Skyscanner.",
      "Pick your route and dates, and we'll show you the best deals.",
    ],
    links: [{ label: "Search flights", href: "/flights" }],
    chips: [MENU_CHIP, HUMAN_CHIP],
  },

  hotels: {
    id: "hotels",
    bot: [
      "🏨 Find hotels and stays in Ghana and beyond — powered by Booking.com.",
      "Tell us where and when, and compare prices instantly.",
    ],
    links: [{ label: "Search hotels", href: "/hotels" }],
    chips: [MENU_CHIP, HUMAN_CHIP],
  },

  pricing: {
    id: "pricing",
    bot: [
      "Our listing packages: 💳",
      "• Free — ₵0, standard listing\n• Premium — ₵50, highlighted + social boost\n• Complete — ₵200, we handle everything including professional promotion",
      "All packages include WhatsApp buyer enquiries through AutoSell.",
    ],
    links: [
      { label: "Compare packages", href: "/#pricing" },
      { label: "Start selling", href: "/sell" },
    ],
    chips: [MENU_CHIP, HUMAN_CHIP],
  },
};
