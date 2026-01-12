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

const formatDateWithOffset = (initialDate: string, daysOffset: number): string => {
  const [day, month, year] = initialDate.split('/').map(Number);
  const startDate = new Date(year, month - 1, day);
  startDate.setDate(startDate.getDate() + daysOffset);
  return startDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const formatDayMessage = (initialDate: string, dayName: DayName, time: string, prefix?: string): string => {
  const daysOffset = DAY_CONFIG[dayName];
  const formattedDate = formatDateWithOffset(initialDate, daysOffset);
  const displayName = prefix ? `${prefix} ${dayName}` : dayName;
  return `${displayName} ${formattedDate} - ${time}`;
};
