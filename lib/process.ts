import { someDaysAgo } from "./date";
import {
  IAnalysisData,
  IContributions,
  IPreparedContributions,
  IProcessContributionsReturnObject,
} from "./types";

const monoQueueShouldPop = (frontDateStr: string, currentDateStr: string) => {
  const lhs = new Date(frontDateStr).getTime(),
    rhs = new Date(currentDateStr).getTime();
  return lhs < rhs - 1 * 366 * 24 * 60 * 60 * 1000;
};

const analysisDataCalc = (rawData: IPreparedContributions[]): IAnalysisData => {
  const ans = {
    min: 0,
    max: 0,
    stdDeviation: 0,
    average: 0,
    median: 0,
  };

  if (rawData.length === 0) {
    return ans;
  }

  const data = rawData.map((item) => item.index);
  const sum = data.reduce((prev, cur) => {
    return prev + cur;
  }, 0);

  ans.average = sum / data.length;
  ans.min = Math.min(...data);
  ans.max = Math.max(...data);
  data.sort();
  if (data.length % 2 === 0) {
    ans.median = 0.5 * (data[data.length / 2] + data[data.length / 2 - 1]);
  } else {
    ans.median = data[data.length / 2];
  }
  ans.stdDeviation = Math.sqrt(
    data.reduce((prev, cur) => {
      return prev + Math.pow(cur - ans.average, 2);
    }, 0)
  );

  return ans;
};

const processContributions = (
  contributions: IContributions[],
  timeWindowRaw: string
): IProcessContributionsReturnObject => {
  contributions.sort((lhs, rhs) => {
    return new Date(lhs.date).getTime() - new Date(rhs.date).getTime();
  });

  const isMonth = timeWindowRaw.endsWith("m");
  if (isMonth) {
    timeWindowRaw = timeWindowRaw.substr(0, timeWindowRaw.length - 1);
  }
  const timeWindow = isMonth ? 32 * +timeWindowRaw : 366 * +timeWindowRaw;
  const someDays = someDaysAgo(new Date(), -timeWindow).getTime();

  const monoQueue: IContributions[] = [];
  let currentVal = 0;
  const ans: IPreparedContributions[] = [];

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

  return {
    preparedContribtuions: ans,
    analysisData: analysisDataCalc(ans),
  };
};

export default processContributions;
