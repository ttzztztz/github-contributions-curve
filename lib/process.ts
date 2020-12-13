import { IContributions, IPreparedContributions } from "./types";

const someDaysAgo = (date: Date, deltaDay: number) => {
  const timestamp = date.getTime();
  return new Date(timestamp + deltaDay * 24 * 60 * 60 * 1000);
};

const monoQueueShouldPop = (frontDateStr: string, currentDateStr: string) => {
  const lhs = new Date(frontDateStr).getTime(),
    rhs = new Date(currentDateStr).getTime();
  return lhs < rhs - 1 * 366 * 24 * 60 * 60 * 1000;
};

const processContributions = (
  contributions: IContributions[],
  timeWindowRaw: string
): IPreparedContributions[] => {
  contributions.sort((lhs, rhs) => {
    return new Date(lhs.date).getTime() - new Date(rhs.date).getTime();
  });

  const isMonth = timeWindowRaw[timeWindowRaw.length - 1] === "m";
  if (isMonth) {
    timeWindowRaw = timeWindowRaw.substr(0, timeWindowRaw.length - 1);
  }
  const timeWindow = isMonth ? 32 * +timeWindowRaw : 366 * +timeWindowRaw;

  const monoQueue: IContributions[] = [];
  let currentVal = 0;
  const ans: IPreparedContributions[] = [];

  const someDays = someDaysAgo(new Date(), -timeWindow).getTime();
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
    if (someDays <= timestamp && timestamp <= now) {
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
