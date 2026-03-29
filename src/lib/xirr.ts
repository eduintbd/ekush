/**
 * XIRR (Extended Internal Rate of Return) calculation
 * Uses Newton-Raphson method to find the rate that makes NPV = 0
 */

interface CashFlow {
  date: Date;
  amount: number; // negative for investments, positive for returns
}

export function calculateXIRR(cashFlows: CashFlow[], guess = 0.1): number | null {
  if (cashFlows.length < 2) return null;

  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = sorted[0].date.getTime();

  // Years from first date
  const years = (d: Date) => (d.getTime() - d0) / (365.25 * 24 * 60 * 60 * 1000);

  // NPV function
  const npv = (rate: number) => {
    return sorted.reduce((sum, cf) => {
      const t = years(cf.date);
      return sum + cf.amount / Math.pow(1 + rate, t);
    }, 0);
  };

  // Derivative of NPV
  const dnpv = (rate: number) => {
    return sorted.reduce((sum, cf) => {
      const t = years(cf.date);
      return sum - t * cf.amount / Math.pow(1 + rate, t + 1);
    }, 0);
  };

  // Newton-Raphson iteration
  let rate = guess;
  const maxIter = 100;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIter; i++) {
    const f = npv(rate);
    const df = dnpv(rate);

    if (Math.abs(df) < 1e-10) break;

    const newRate = rate - f / df;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Guard against divergence
    if (rate < -0.99 || rate > 10) return null;
  }

  // If didn't converge, return null
  return Math.abs(npv(rate)) < 0.01 ? rate : null;
}

/**
 * Build cash flows from transactions and current holdings for XIRR
 */
export function buildCashFlows(
  transactions: { orderDate: Date; direction: string; amount: number }[],
  currentMarketValue: number
): CashFlow[] {
  const flows: CashFlow[] = [];

  for (const tx of transactions) {
    flows.push({
      date: new Date(tx.orderDate),
      amount: tx.direction === "BUY" ? -tx.amount : tx.amount,
    });
  }

  // Add current value as final positive cash flow
  if (currentMarketValue > 0) {
    flows.push({
      date: new Date(),
      amount: currentMarketValue,
    });
  }

  return flows;
}
