import {
  parseSearch,
  PlacesError,
  searchGoogle,
  statusGoogle,
} from "@/lib/google-places";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const reply = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  // Browser calls must originate from this app. No coordinates in URLs or logs.
  try {
    if (
      request.headers.get("origin") &&
      new URL(request.headers.get("origin")!).host !==
        request.headers.get("host")
    )
      return reply({ error: "forbidden" }, 403);
    const body = await request.json();
    if (body?.action === "status") {
      if (typeof body.id !== "string") throw new PlacesError("invalid-id", 400);
      return reply({ status: await statusGoogle(body.id) });
    }
    return reply({ places: await searchGoogle(parseSearch(body)) });
  } catch (e) {
    if (e instanceof PlacesError) return reply({ error: e.code }, e.status);
    if (e instanceof SyntaxError)
      return reply({ error: "invalid-search" }, 400);
    return reply({ error: "provider-unavailable" }, 502);
  }
}
