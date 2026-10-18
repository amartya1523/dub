import { bulkUpdateLinksBodySchema } from "@/lib/zod/schemas/links";
import { describe, expect, it } from "vitest";

describe("bulkUpdateLinksBodySchema", () => {
  it("strips the `ext_` prefix from externalIds", () => {
    const { externalIds } = bulkUpdateLinksBodySchema.parse({
      externalIds: ["ext_123", "ext_abc"],
      data: {},
    });

    expect(externalIds).toEqual(["123", "abc"]);
  });

  it("leaves externalIds without the prefix unchanged", () => {
    const { externalIds } = bulkUpdateLinksBodySchema.parse({
      externalIds: ["123", "next_456"],
      data: {},
    });

    expect(externalIds).toEqual(["123", "next_456"]);
  });

  it("defaults externalIds to an empty array", () => {
    const { externalIds } = bulkUpdateLinksBodySchema.parse({
      linkIds: ["link_123"],
      data: {},
    });

    expect(externalIds).toEqual([]);
  });
});
