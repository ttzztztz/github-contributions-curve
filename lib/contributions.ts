import cheerio from "cheerio";
import fetch from "node-fetch";

const fetchYears = async (username: string) => {
  const data = await fetch(`https://github.com/${username}`);
  const $ = cheerio.load(await data.text());
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
  const $ = cheerio.load(await data.text());
  const $days = $("rect.day");
  const contribText = $(".js-yearly-contributions h2")
    .text()
    .trim()
    .match(/^([0-9,]+)\s/);
  let contribCount = 0;
  if (contribText) {
    const [tempContribText] = contribText;
    contribCount = +(tempContribText.replace(/,/g, ""), 10);
  }

  return {
    year,
    total: contribCount ?? 0,
    range: {
      start: $($days.get(0)).attr("data-date"),
      end: $($days.get($days.length - 1)).attr("data-date"),
    },
    contributions: (() => {
      const parseDay = (day) => {
        const $day = $(day);
        const date = $day
          .attr("data-date")
          .split("-")
          .map((d) => parseInt(d, 10));
        const value = {
          date: $day.attr("data-date"),
          count: parseInt($day.attr("data-count"), 10),
        };
        return { date, value };
      };

      return $days.get().map((day) => parseDay(day).value);
    })(),
  };
};

const fetchGithubUserContributions = async (username: string) => {
  const years = await fetchYears(username);
  return Promise.all(
    years.map((year) => fetchDataForYear(year.href, year.text))
  ).then((resp) => {
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
  });
};

export default fetchGithubUserContributions;
