import { NextApiRequest, NextApiResponse } from "next";
import fetchGithubUserContributions from "../../lib/contributions";

import fs from 'fs';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const content = fs.readFileSync('./pages/api/data.json')
  res.send(content);
  return;

  const { username } = req.query;
  const data = await fetchGithubUserContributions(username as string);
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.json(data);
};
