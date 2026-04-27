/**
 * Constant Product AMM Engine (x * y = k)
 * Standard Soroban Liquidity Pool Logic
 */

export const calculateOutputAmount = (
  amountIn: string,
  reserveIn: string,
  reserveOut: string
): string => {
  const ain = parseFloat(amountIn);
  const rin = parseFloat(reserveIn);
  const rout = parseFloat(reserveOut);

  if (ain <= 0 || rin <= 0 || rout <= 0) return "0";

  // Formula: (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
  const amountInWithFee = ain * 997;
  const numerator = amountInWithFee * rout;
  const denominator = rin * 1000 + amountInWithFee;

  return (numerator / denominator).toFixed(7);
};

export const calculatePriceImpact = (
  amountIn: string,
  reserveIn: string
): string => {
  const ain = parseFloat(amountIn);
  const rin = parseFloat(reserveIn);

  if (!ain || !rin) return "0.00";

  // Simple approximation: (amountIn / reserveIn) * 100
  const impact = (ain / (rin + ain)) * 100;
  return impact.toFixed(2);
};

export const getPrice = (reserveA: string, reserveB: string): string => {
  const ra = parseFloat(reserveA);
  const rb = parseFloat(reserveB);
  if (ra === 0) return "0";
  return (rb / ra).toFixed(7);
};
