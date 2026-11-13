import { describe, expect, it } from "vitest";
import { bullets, isUrl, orNotSpecified } from "@/lib/format";

describe("output formatting rules", () => {
  it("shows 'Not specified' when the AI found no items", () => {
    expect(bullets([])).toBe("Not specified");
    expect(bullets(["  ", ""])).toBe("Not specified");
  });
  it("shows 'Not specified' for a missing owner or deadline", () => {
    expect(orNotSpecified("")).toBe("Not specified");
    expect(orNotSpecified("Leila")).toBe("Leila");
  });
  it("only treats a lone link as a URL to read", () => {
    expect(isUrl(" https://example.com/a ")).toBe(true);
    expect(isUrl("read https://example.com please")).toBe(false);
  });
});
