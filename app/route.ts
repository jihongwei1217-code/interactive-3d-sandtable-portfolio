import homeHtml from "../public/home.html?raw";

const headers = {
  "cache-control":
    "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
  "content-type": "text/html; charset=utf-8",
};

export async function GET() {
  return new Response(homeHtml, { headers });
}

export async function HEAD() {
  return new Response(null, { headers });
}
