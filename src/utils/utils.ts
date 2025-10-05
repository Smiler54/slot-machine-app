export const formatCurrency = (num: number ) => {
  if (!num) return "0.00";
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
};
