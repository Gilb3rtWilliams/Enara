const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const diffDays = (a: Date, b: Date) =>
  Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);

export const dayNumber = (iso: string) => pad(new Date(iso).getDate());
export const monthShort = (iso: string) => MONTHS[new Date(iso).getMonth()];
export const formatDay = (iso: string) => `${new Date(iso).getDate()} ${MONTHS[new Date(iso).getMonth()]}`;

export function completedLabel(iso: string, now = new Date()): string {
  const days = diffDays(now, new Date(iso));
  if (days <= 0) return "Completed today";
  if (days === 1) return "Completed yesterday";
  return `Completed ${formatDay(iso)}`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
