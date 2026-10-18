import { detectBot } from "@/lib/middleware/utils/detect-bot";
import { describe, expect, it } from "vitest";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

const createRequest = ({
  headers = {},
  method = "GET",
  url = "https://dub.sh/github",
}: {
  headers?: Record<string, string>;
  method?: string;
  url?: string;
} = {}) => new Request(url, { method, headers });

describe("detectBot", () => {
  it("returns false for a regular browser request", () => {
    expect(
      detectBot(
        createRequest({
          headers: { "user-agent": BROWSER_UA, "x-real-ip": "203.0.113.10" },
        }),
      ),
    ).toBe(false);
  });

  it("detects bots by user agent", () => {
    expect(
      detectBot(
        createRequest({
          headers: {
            "user-agent":
              "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          },
        }),
      ),
    ).toBe(true);
  });

  it("detects HEAD requests and ?bot=1", () => {
    expect(detectBot(createRequest({ method: "HEAD" }))).toBe(true);
    expect(
      detectBot(createRequest({ url: "https://dub.sh/github?bot=1" })),
    ).toBe(true);
  });

  it("detects bots by referer when the user agent looks like a browser", () => {
    expect(
      detectBot(
        createRequest({
          headers: {
            "user-agent": BROWSER_UA,
            referer: "https://url.emailprotection.link/?abc",
          },
        }),
      ),
    ).toBe(true);
  });

  it("detects bots by exact IP when the user agent looks like a browser", () => {
    expect(
      detectBot(
        createRequest({
          headers: { "user-agent": BROWSER_UA, "x-real-ip": "127.0.0.1" },
        }),
      ),
    ).toBe(true);
  });

  it("detects bots by IP range when the user agent looks like a browser", () => {
    expect(
      detectBot(
        createRequest({
          headers: { "user-agent": BROWSER_UA, "x-real-ip": "159.148.128.42" },
        }),
      ),
    ).toBe(true);
  });

  it("falls through to the IP checks when there is no user agent", () => {
    expect(
      detectBot(createRequest({ headers: { "x-real-ip": "159.148.128.42" } })),
    ).toBe(true);
    expect(
      detectBot(createRequest({ headers: { "x-real-ip": "203.0.113.10" } })),
    ).toBe(false);
  });
});
