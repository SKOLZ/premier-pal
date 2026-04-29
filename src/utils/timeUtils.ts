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

const formatDateWithOffset = (
  initialDate: string,
  daysOffset: number,
): string => {
  const [day, month, year] = initialDate.split('/').map(Number);
  const startDate = new Date(year, month - 1, day);
  startDate.setDate(startDate.getDate() + daysOffset);
  return startDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const formatDayMessage = (
  initialDate: string,
  dayName: DayName,
  time: string,
  prefix?: string,
): string => {
  const daysOffset = DAY_CONFIG[dayName];
  const formattedDate = formatDateWithOffset(initialDate, daysOffset);
  const displayName = prefix ? `${prefix} ${dayName}` : dayName;
  return `${displayName} ${formattedDate} - ${time}`;
};

export const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check for leap year
  if (
    month === 2 &&
    ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
  ) {
    return day <= 29;
  }

  return day <= daysInMonth[month - 1];
};
