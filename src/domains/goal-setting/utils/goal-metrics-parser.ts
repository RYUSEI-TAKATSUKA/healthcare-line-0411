const extractWeight = (text: string): number | null => {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|ｋｇ|キロ|キログラム)/i);
  if (match) return Number(match[1]);

  // fallback: first number when unit omitted
  const fallback = text.match(/(\d+(?:\.\d+)?)/);
  return fallback ? Number(fallback[1]) : null;
};

export const buildTargetMetrics = (baseline: string, desired: string) => {
  const startValue = extractWeight(baseline);
  const targetValue = extractWeight(desired);

  if (startValue === null && targetValue === null) return null;

  return {
    startValue: startValue ?? undefined,
    targetValue: targetValue ?? undefined,
    unit: 'kg',
  };
};
