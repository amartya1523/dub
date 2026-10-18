import { getFirstAndLastDay } from "./get-first-and-last-day";

// Returns the current billing period bounds for usage display.
// Yearly plans use Stripe's period end; monthly plans use billingCycleStart day-of-month.
export function getBillingPeriodBounds({
  planPeriod,
  billingCycleStart,
  billingCycleEndsAt,
}: {
  planPeriod?: string | null;
  billingCycleStart: number;
  billingCycleEndsAt?: Date | string | null;
}): { start: Date; end: Date; displayEnd: Date } {
  if (planPeriod === "yearly" && billingCycleEndsAt) {
    const periodEnd = new Date(billingCycleEndsAt);
    const start = new Date(periodEnd);
    start.setFullYear(start.getFullYear() - 1);
    const now = new Date();
    const end = now < periodEnd ? now : periodEnd;

    return {
      start,
      end,
      displayEnd: periodEnd,
    };
  }

  const { firstDay, lastDay } = getFirstAndLastDay(billingCycleStart);

  return {
    start: firstDay,
    end: lastDay,
    displayEnd: lastDay,
  };
}

// Function to get the last day of the current month
export const getLastDayOfMonth = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // This will give the last day of the current month
  return lastDay.getDate();
};

// Adjust the billingCycleStart based on the number of days in the current month
export const getAdjustedBillingCycleStart = (billingCycleStart: number) => {
  const lastDay = getLastDayOfMonth();
  if (billingCycleStart > lastDay) {
    return lastDay;
  } else {
    return billingCycleStart;
  }
};

export const getBillingStartDate = (billingCycleStart: number) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const adjustedBillingCycleStart =
    getAdjustedBillingCycleStart(billingCycleStart);

  if (currentDay < adjustedBillingCycleStart) {
    // if the current day is less than the billing cycle start, we need to go back a month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; // if the current month is January, we need to go back to December
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear; // if the current month is January, we need to go back a year
    // clamp the billing cycle start to the number of days in the previous month
    // (e.g. a billing cycle start of 31 should resolve to Feb 28, not Mar 3)
    const lastDayOfLastMonth = new Date(lastYear, lastMonth + 1, 0).getDate();
    return new Date(
      lastYear,
      lastMonth,
      Math.min(billingCycleStart, lastDayOfLastMonth),
    );
  } else {
    return new Date(currentYear, currentMonth, adjustedBillingCycleStart);
  }
};
