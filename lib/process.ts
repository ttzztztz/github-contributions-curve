import { IContributions, IPreparedContributions } from "./types";

const someYearAgo = (date: Date, deltaYear: number) => {
  return new Date(
    `${date.getFullYear() + deltaYear}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDay().toString().padStart(2, "0")}`
  );
};

const monoQueueShouldPop = (frontDateStr: string, currentDateStr: string) => {
  const lhs = new Date(frontDateStr).getTime(),
    rhs = new Date(currentDateStr).getTime();
  return lhs < rhs - 1 * 365 * 24 * 60 * 60 * 1000;
};

const processContributions = (
  contributions: IContributions[],
  timeWindow: number
): IPreparedContributions[] => {
  contributions.sort((lhs, rhs) => {
    return new Date(lhs.date).getTime() - new Date(rhs.date).getTime();
  });

  const monoQueue: IContributions[] = [];
  let currentVal = 0;
  const ans: IPreparedContributions[] = [];

  const someYearsAgo = someYearAgo(new Date(), -timeWindow).getTime();

  const now = new Date().getTime();
  contributions.forEach(({ date, count }) => {
    while (
      monoQueue.length > 0 &&
      monoQueueShouldPop(monoQueue[0].date, date)
    ) {
      currentVal -= monoQueue.shift().count;
    }

    monoQueue.push({ date, count });
    currentVal += count;

    const timestamp = new Date(date).getTime();
    if (someYearsAgo <= timestamp && timestamp <= now) {
      ans.push({
        date,
        delta: count,
        index: currentVal,
      });
    }
  });

  return ans;
};

export default processContributions;
