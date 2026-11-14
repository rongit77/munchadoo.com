export type Locale = "he" | "en";
export type Cuisine =
  "all" | "pizza" | "burger" | "asian" | "mediterranean" | "cafe";
export type Point = { lat: number; lng: number };
export type Place = {
  id: string;
  name: Record<Locale, string>;
  cuisine: Exclude<Cuisine, "all">;
  point: Point;
  status: "open" | "closed" | "unknown";
  street: Record<Locale, string>;
  color: string;
  food: string;
  price: 1 | 2 | 3;
  source: "demo";
};
export type Search = {
  center: Point;
  radius: number;
  cuisine: Cuisine;
  openOnly: boolean;
};
export interface PlacesProvider {
  search(query: Search): Promise<Place[]>;
  status(id: string): Promise<Place["status"]>;
}
export const areas = [
  {
    id: "tel-aviv",
    name: { he: "תל אביב · מרכז העיר", en: "Tel Aviv · City center" },
    point: { lat: 32.074, lng: 34.775 },
  },
  {
    id: "haifa",
    name: { he: "חיפה · מרכז הכרמל", en: "Haifa · Carmel center" },
    point: { lat: 32.803, lng: 34.987 },
  },
  {
    id: "jerusalem",
    name: { he: "ירושלים · מרכז העיר", en: "Jerusalem · City center" },
    point: { lat: 31.781, lng: 35.219 },
  },
];
export const fixtures: Place[] = [
  {
    id: "pizza",
    name: { he: "פיצה לונה", en: "Pizza Luna" },
    cuisine: "pizza",
    point: { lat: 32.076, lng: 34.778 },
    status: "open",
    street: { he: "רחוב הדמיון 12", en: "12 Imaginary Lane" },
    color: "peach",
    food: "pizza",
    price: 2,
    source: "demo",
  },
  {
    id: "burger",
    name: { he: "באן באדי", en: "Bun Buddy" },
    cuisine: "burger",
    point: { lat: 32.07, lng: 34.77 },
    status: "open",
    street: { he: "שדרת הטעמים 8", en: "8 Flavor Avenue" },
    color: "yellow",
    food: "burger",
    price: 2,
    source: "demo",
  },
  {
    id: "noodle",
    name: { he: "נודל קלאב", en: "Noodle Club" },
    cuisine: "asian",
    point: { lat: 32.083, lng: 34.78 },
    status: "open",
    street: { he: "סמטת האטריות 3", en: "3 Noodle Alley" },
    color: "lilac",
    food: "noodle",
    price: 2,
    source: "demo",
  },
  {
    id: "green",
    name: { he: "טבלה ירוקה", en: "Green Table" },
    cuisine: "mediterranean",
    point: { lat: 32.065, lng: 34.781 },
    status: "open",
    street: { he: "דרך הגינה 21", en: "21 Garden Way" },
    color: "green",
    food: "salad",
    price: 1,
    source: "demo",
  },
  {
    id: "cafe",
    name: { he: "קפה סאנשיין", en: "Sunshine Café" },
    cuisine: "cafe",
    point: { lat: 32.09, lng: 34.773 },
    status: "open",
    street: { he: "כיכר השמש 4", en: "4 Sunshine Square" },
    color: "pink",
    food: "coffee",
    price: 1,
    source: "demo",
  },
  {
    id: "slice",
    name: { he: "סלייס אוף ג׳וי", en: "Slice of Joy" },
    cuisine: "pizza",
    point: { lat: 32.1, lng: 34.79 },
    status: "closed",
    street: { he: "רחוב החיוך 6", en: "6 Smile Street" },
    color: "peach",
    food: "pizza",
    price: 2,
    source: "demo",
  },
  {
    id: "moon",
    name: { he: "מון בול", en: "Moon Bowl" },
    cuisine: "asian",
    point: { lat: 32.073, lng: 34.789 },
    status: "unknown",
    street: { he: "דרך הירח 9", en: "9 Moon Road" },
    color: "lilac",
    food: "noodle",
    price: 3,
    source: "demo",
  },
];
export function distanceKm(a: Point, b: Point) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const x =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export function validPoint(p: Point) {
  return (
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}
export function filterPlaces(places: Place[], query: Search) {
  if (
    !validPoint(query.center) ||
    !Number.isFinite(query.radius) ||
    query.radius < 1 ||
    query.radius > 20
  )
    throw new Error("invalid-search");
  const unique = new Map(places.map((p) => [p.id, p]));
  return [...unique.values()]
    .filter(
      (p) =>
        validPoint(p.point) &&
        (query.cuisine === "all" || p.cuisine === query.cuisine) &&
        (!query.openOnly || p.status === "open") &&
        distanceKm(query.center, p.point) <= query.radius,
    )
    .sort(
      (a, b) =>
        distanceKm(query.center, a.point) - distanceKm(query.center, b.point),
    );
}
export function choosePlace(
  places: Place[],
  previous?: string,
  random: () => number = Math.random,
): Place | null {
  const eligible = [
    ...new Map(
      places.filter((p) => p.status === "open").map((p) => [p.id, p]),
    ).values(),
  ];
  const pool =
    eligible.length > 1 ? eligible.filter((p) => p.id !== previous) : eligible;
  if (!pool.length) return null;
  const value = random();
  if (value < 0 || value >= 1 || !Number.isFinite(value))
    throw new Error("invalid-random");
  return pool[Math.floor(value * pool.length)];
}
export const demoProvider: PlacesProvider = {
  async search(query) {
    return filterPlaces(fixtures, query);
  },
  async status(id) {
    return fixtures.find((p) => p.id === id)?.status ?? "unknown";
  },
};
