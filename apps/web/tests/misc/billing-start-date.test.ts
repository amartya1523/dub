import { getBillingStartDate } from "@dub/utils";
import { afterEach, describe, expect, it, vi } from "vitest";

const setToday = (year: number, month: number, day: number) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(year, month, day, 12));
};

const expectDate = (date: Date, year: number, month: number, day: number) => {
  expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
    year,
    month,
    day,
  ]);
};

describe("getBillingStartDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns this month's cycle start once it has passed", () => {
    setToday(2026, 9, 20); // Oct 20
    expectDate(getBillingStartDate(15), 2026, 9, 15);
  });

  it("returns this month's cycle start on the billing cycle start day itself", () => {
    setToday(2026, 9, 15); // Oct 15
    expectDate(getBillingStartDate(15), 2026, 9, 15);
  });

  it("returns last month's cycle start before the billing cycle start day", () => {
    setToday(2026, 9, 10); // Oct 10
    expectDate(getBillingStartDate(15), 2026, 8, 15);
  });

  it("goes back to December of the previous year in January", () => {
    setToday(2026, 0, 10); // Jan 10
    expectDate(getBillingStartDate(15), 2025, 11, 15);
  });

  it("clamps the cycle start to the length of the previous month", () => {
    setToday(2026, 2, 15); // Mar 15
    expectDate(getBillingStartDate(31), 2026, 1, 28); // Feb 28, not Mar 3

    setToday(2028, 2, 15); // Mar 15 (leap year)
    expectDate(getBillingStartDate(30), 2028, 1, 29); // Feb 29
  });

  it("does not clamp the previous month to the length of the current month", () => {
    setToday(2026, 1, 15); // Feb 15
    expectDate(getBillingStartDate(31), 2026, 0, 31); // Jan 31, not Jan 28
  });

  it("clamps the cycle start to the length of the current month", () => {
    setToday(2026, 1, 28); // Feb 28
    expectDate(getBillingStartDate(31), 2026, 1, 28);
  });
});
