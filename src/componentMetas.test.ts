import { describe, it, expect } from "vitest";
import { componentPrototypeMap } from "@/componentMetas";

describe("componentMetas (children slot)", () => {
  it("defines a children slot for Page", () => {
    const page = componentPrototypeMap.Page;
    const childrenSlot = page.slots?.find((slot) => slot.path === "children");
    expect(childrenSlot).toBeTruthy();
  });
});
