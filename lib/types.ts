export interface IContributions {
  date: string;
  count: number;
}

export interface IPreparedContributions {
  date: string;
  delta: number;
  index: number;
}

export interface IAnalysisData {
  min: number;
  max: number;
  stdDeviation: number;
  average: number;
  median: number;
}

export interface IProcessContributionsReturnObject {
  preparedContribtuions: IPreparedContributions[];
  analysisData: IAnalysisData;
}
