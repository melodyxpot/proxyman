import { proxyRequest } from "./src/proxy.js";

export const config = {
  runtime: "nodejs",
  matcher: "/:path*",
};

export default function middleware(request: Request) {
  return proxyRequest(request);
}
