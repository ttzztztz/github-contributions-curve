import { NextApiRequest, NextApiResponse } from "next";
import jsdom, { JSDOM } from "jsdom";
import fetch from "node-fetch";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const username = 'ttzztztz'
  const timeWindow = '1'

  const documentRes = await fetch(
    "https://github-contributions-curve.ttzztztz.vercel.app/"
  );
  const {window} = new JSDOM(await documentRes.text(), {
    runScripts: "dangerously",
  });

  res.write("not done yet!");
};
