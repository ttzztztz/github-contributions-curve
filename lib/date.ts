export const someDaysAgo = (date: Date, deltaDay: number) => {
  const timestamp = date.getTime();
  return new Date(timestamp + deltaDay * 24 * 60 * 60 * 1000);
};
