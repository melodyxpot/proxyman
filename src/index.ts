import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { proxyRequest } from "./proxy.js";

const PORT = Number(process.env.PORT ?? 3000);
const proxyBaseUrl = process.env.PROXY_BASE_URL?.replace(/\/$/, "");

if (!proxyBaseUrl) {
  console.error("Missing PROXY_BASE_URL in .env");
  process.exit(1);
}

const app = new Hono();
app.all("*", (c) => proxyRequest(c.req.raw));

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API proxy listening on http://localhost:${PORT}`);
  console.log(`Forwarding to ${proxyBaseUrl}`);
});
