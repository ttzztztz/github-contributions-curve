import cheerio from "cheerio";
import fetch from "node-fetch";
import { someDaysAgo } from "./date";

const fetchYears = async (username: string) => {
  const data = await fetch(`https://github.com/${username}`);
  const text_html = await data.text();
  const $ = cheerio.load(text_html);
  return $(".js-year-link")
    .get()
    .map((a) => {
      const $a = $(a);
      return {
        href: $a.attr("href"),
        text: $a.text().trim(),
      };
    });
};

const fetchDataForYear = async (url: string, year: string) => {
  const data = await fetch(`https://github.com${url}`);
  const text_html = await data.text();
  const $ = cheerio.load(text_html);
  const $days = $(".js-calendar-graph-svg rect");
  const contribText = $(".js-yearly-contributions h2")
    .text()
    .trim()
    .match(/^([0-9,]+)\s/);
  let contribCount = 0;
  if (contribText) {
    const [tempContribText] = contribText;
    contribCount = +tempContribText.replace(/,/g, "");
  }

  const parseDay = (day: string) => {
    const $day = $(day);
    const date = $day
      .attr("data-date")
      .split("-")
      .map((d) => +d);
    const value = {
      date: $day.attr("data-date"),
      count: +$day.attr("data-count"),
    };

    return { date, value };
  };

  const contributions = $days.get().map((day) => parseDay(day).value);

  return {
    year,
    total: contribCount ?? 0,
    range: {
      start: $($days.get(0)).attr("data-date"),
      end: $($days.get($days.length - 1)).attr("data-date"),
    },
    contributions,
  };
};

const fetchGithubUserContributions = async (
  username: string,
  timeWindowRaw: string | undefined
) => {
  let years = await fetchYears(username);

  if (timeWindowRaw) {
    const isMonth = timeWindowRaw.endsWith("m");
    if (isMonth) {
      timeWindowRaw = timeWindowRaw.substr(0, timeWindowRaw.length - 1);
    }
    const timeWindow = Math.max(
      366 * 1,
      isMonth ? 32 * +timeWindowRaw : 366 * +timeWindowRaw
    );
    const someDays = someDaysAgo(new Date(), -(timeWindow * 2));
    const leastYear = someDays.getFullYear();

    years = years.filter(({ text }) => leastYear <= +text);
  }
  const resp = await Promise.all(
    years.map((year) => fetchDataForYear(year.href, year.text))
  );

  return {
    years: resp.map((year) => {
      const { contributions, range, ...rest } = year;
      return rest;
    }),
    contributions: resp
      .reduce((list, curr) => [...list, ...curr.contributions], [])
      .sort((a, b) => {
        if (a.date < b.date) return 1;
        else if (a.date > b.date) return -1;
        return 0;
      }),
  };
};

export default fetchGithubUserContributions;
