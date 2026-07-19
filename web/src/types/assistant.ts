export type AssistantSearchResult = {
  id: number;
  vertical: "cars" | "rentals";
  title: string;
  priceLabel: string;
  location: string;
  photo: string | null;
  url: string;
};

export type AssistantSearchResponse = {
  ok: true;
  results: AssistantSearchResult[];
};
