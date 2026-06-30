const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getProxyBaseUrl(): string | undefined {
  return process.env.PROXY_BASE_URL?.replace(/\/$/, "");
}

function forwardRequestHeaders(incoming: Headers): Headers {
  const headers = new Headers();

  incoming.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

export async function proxyRequest(request: Request): Promise<Response> {
  const proxyBaseUrl = getProxyBaseUrl();
  if (!proxyBaseUrl) {
    return Response.json({ error: "PROXY_BASE_URL is not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const targetUrl = `${proxyBaseUrl}${url.pathname}${url.search}`;

  const method = request.method;
  const hasBody = !["GET", "HEAD"].includes(method);

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: forwardRequestHeaders(request.headers),
    redirect: "manual",
  };

  if (hasBody) {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const response = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy request failed";
    return Response.json({ error: "Proxy request failed", message, targetUrl }, { status: 502 });
  }
}
