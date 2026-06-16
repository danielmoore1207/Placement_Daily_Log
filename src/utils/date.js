import { format, parseISO } from "date-fns";

export const formatDisplayDate = (isoDate) => format(parseISO(isoDate), "EEE, d MMM yyyy");
export const monthKeyFromIsoDate = (isoDate) => format(parseISO(isoDate), "yyyy-MM");

export const todayIsoDate = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now - tzOffset).toISOString().slice(0, 10);
};
