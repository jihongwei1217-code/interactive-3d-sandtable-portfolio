const SOURCE_ORIGIN =
  process.env.PUBLIC_ASSET_ORIGIN ??
  "https://sandtable-3d-starter.jihongwei1217.chatgpt.site";
const BLOCKED_DOWNLOAD = /\.(?:zip|stl|3mf|stp|step)(?:$|[?#])/i;

async function proxy(request: Request) {
  const incoming = new URL(request.url);
  if (BLOCKED_DOWNLOAD.test(incoming.pathname)) {
    return new Response("公开展示版不提供文件下载", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const sourceUrl = new URL(`${incoming.pathname}${incoming.search}`, SOURCE_ORIGIN);
  const requestHeaders = new Headers();
  for (const name of ["accept", "range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }
  requestHeaders.set("accept-encoding", "identity");

  const sourceResponse = await fetch(sourceUrl, {
    method: request.method,
    headers: requestHeaders,
    redirect: "follow",
  });
  const responseHeaders = new Headers(sourceResponse.headers);
  responseHeaders.delete("content-security-policy");
  responseHeaders.delete("content-security-policy-report-only");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("set-cookie");
  responseHeaders.set("cache-control", "public, max-age=3600");

  return new Response(request.method === "HEAD" ? null : sourceResponse.body, {
    status: sourceResponse.status,
    statusText: sourceResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: Request) {
  return proxy(request);
}

export async function HEAD(request: Request) {
  return proxy(request);
}
