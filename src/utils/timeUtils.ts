export const DAY_CONFIG = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
} as const;

export type DayName = keyof typeof DAY_CONFIG;

const formatDateWithOffset = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const formatDayMessage = (dayName: DayName, time: string, prefix?: string): string => {
  const daysOffset = DAY_CONFIG[dayName];
  const formattedDate = formatDateWithOffset(daysOffset);
  const displayName = prefix ? `${prefix} ${dayName}` : dayName;
  return `${displayName} ${formattedDate} - ${time}`;
};
