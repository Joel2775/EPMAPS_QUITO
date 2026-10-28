export function currentMonthYear(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}-${date.getFullYear()}`;
}
