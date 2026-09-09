// Local integration-test fixture only. Never used by the normal dev server.
import { createServer } from "node:http";
const admin = { id: 1, email: "test@example.com", name: "테스트 관리자", status: "ACTIVE" };
let activeToken = "";
createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const send = (status, data, code = "SUCCESS") => {
    res.writeHead(status);
    res.end(JSON.stringify({ success: status === 200, code, message: code, data }));
  };
  if (req.url === "/api/v1/auth/login" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const input = JSON.parse(body);
    if (input.password !== "test-password") return send(401, null, "AUTH_INVALID_CREDENTIALS");
    if (input.email === "malformed@example.com") return send(200, { accessToken: "bad" });
    activeToken = input.email === "expired@example.com" ? "expired-test-token" : "test-token";
    await new Promise(resolve => setTimeout(resolve, 400));
    return send(200, { accessToken: activeToken, tokenType: "Bearer", expiresIn: 3600, admin });
  }
  if (req.headers.authorization !== "Bearer " + activeToken || !activeToken || activeToken === "expired-test-token") return send(401, null);
  if (req.url === "/api/v1/auth/me") return send(200, admin);
  if (req.url === "/api/v1/auth/logout") { activeToken = ""; return send(200, null); }
  return send(404, null);
}).listen(18080, "127.0.0.1", () => console.log("Test auth API: 127.0.0.1:18080"));
