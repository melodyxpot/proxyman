import { proxyRequest } from "./src/proxy";

export const config = {
  runtime: "nodejs",
  matcher: "/:path*",
};

export default function middleware(request: Request) {
  return proxyRequest(request);
}
