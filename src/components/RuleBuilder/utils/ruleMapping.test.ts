import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { nodesToRules } from "./nodesToRules";

describe("ruleMapping operator inference", () => {
 
  it("dateRange validator validates single date against min/max", async () => {
    const nodes: any = [
      {
        id: "d1",
        type: "dateRange",
        enabled: true,
        params: { minDate: "2020-01-01", maxDate: "2020-01-10" },
        message: "date range",
      },
    ];
    const rules = nodesToRules(nodes) as any[];
    expect(rules.length).toBe(1);
    const validator = rules[0].validator as Function;
    await expect(validator({}, "2020-01-05")).resolves.toBeUndefined();
    await expect(validator({}, "2019-12-31")).rejects.toBeDefined();
    await expect(validator({}, "2020-01-11")).rejects.toBeDefined();
  });

  it("range (date) validator validates single date against min/max (absolute)", async () => {
    const nodes: any = [
      {
        id: "d2",
        type: "range",
        enabled: true,
        params: {
          valueType: "date",
          minDate: "2021-05-01",
          maxDate: "2021-05-10",
        },
        message: "single date range",
      },
    ];
    const rules = nodesToRules(nodes) as any[];
    expect(rules.length).toBe(1);
    const validator = rules[0].validator as Function;
    await expect(validator({}, "2021-05-05")).resolves.toBeUndefined();
    await expect(validator({}, "2021-04-30")).rejects.toBeDefined();
    await expect(validator({}, "2021-05-11")).rejects.toBeDefined();
  });

  it("range (date) validator validates single date against relative min (today)", async () => {
    const nodes: any = [
      {
        id: "d3",
        type: "range",
        enabled: true,
        params: {
          valueType: "date",
          operator: "gte",
          minDate: { type: "relative", preset: "today" },
        },
        message: "relative min",
      },
    ];
    const rules = nodesToRules(nodes) as any[];
    const validator = rules[0].validator as Function;
    const today = dayjs().format("YYYY-MM-DD");
    await expect(validator({}, today)).resolves.toBeUndefined();
    await expect(
      validator({}, dayjs().add(-1, "day").format("YYYY-MM-DD")),
    ).rejects.toBeDefined();
  });
});
