import { NextApiRequest, NextApiResponse } from "next";
import fetchGithubUserContributions from "../../lib/contributions";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, window } = req.query;

  const timeWindow: string | undefined = window as string;
  const data = await fetchGithubUserContributions(
    username as string,
    timeWindow
  );
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.json(data);
};
