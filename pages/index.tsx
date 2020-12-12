import Head from "next/head";
import { Chart } from "@antv/g2";
import { useState } from "react";
import processContributions from "../lib/process";

const classnames = (...props: string[]) => {
  return props.join(" ");
};

const Home = () => {
  const [username, setUsername] = useState("");
  const [timeWindow, setTimeWindow] = useState("2");
  const [chartInstance, setChartInstance] = useState<null | Chart>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDelta, setCurrentDelta] = useState(0.0);
  const [indexClassName, setIndexClassName] = useState("index-black");

  const renderChart = async () => {
    chartInstance?.destroy();

    const resp = await fetch(`/api/${username}`);
    const { years, contributions } = await resp.json();

    const preparedContribtuions = processContributions(
      contributions,
      +timeWindow
    );
    console.log({ years, contributions, preparedContribtuions });

    const chart = new Chart({
      container: "chart-area",
      autoFit: true,
      height: 500,
    });
    chart.data(preparedContribtuions);

    chart.scale({
      date: {
        alias: "Date",
        type: "time",
      },
      index: {
        alias: "Index",
        sync: true,
      },
      delta: {
        alias: "Delta",
        sync: true,
      },
    });

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });

    chart.axis("delta", {
      title: {},
      grid: null,
    });
    chart.axis("index", {
      title: {},
    });

    chart.line().position("date*delta").color("#9AD681");
    chart.line().position("date*index").color("#4FAAEB");
    chart.render();

    setChartInstance(chart);
    const len = preparedContribtuions.length;
    if (len >= 2) {
      const [prevContribution, lastContribution] = [
        preparedContribtuions[0],
        preparedContribtuions[len - 1],
      ];
      setCurrentIndex(lastContribution.index);
      setCurrentDelta(
        +(
          (100.0 * (lastContribution.index - prevContribution.index)) /
          prevContribution.index
        ).toFixed(2)
      );

      if (lastContribution.index === prevContribution.index) {
        setIndexClassName("index-black");
      } else if (lastContribution.index > prevContribution.index) {
        setIndexClassName("index-red");
      } else {
        // lastContribution.index < prevContribution.index
        setIndexClassName("index-green");
      }
    }
  };

  return (
    <>
      <Head>
        <title>Github Contributions Chart</title>
      </Head>
      <main>
        <div className="control-container">
          <input
            type="text"
            value={username}
            placeholder="Github username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
          <select
            name="time-window"
            onChange={(e) => {
              setTimeWindow(e.target.value);
            }}
            value={timeWindow}
          >
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="5">5 Years</option>
          </select>
          <button onClick={() => renderChart()}>Generate</button>
        </div>
        <div className={classnames("index", indexClassName)}>
          <span className="current-index">{currentIndex}pts</span>
          <span className="current-delta">
            {currentDelta > 0 ? "+" : ""}
            {currentDelta}%
          </span>
        </div>
        <div id="chart-area"></div>

        <footer>
          <a href="https://github.com/ttzztztz/github-contributions-curve">Github</a>
        </footer>
      </main>
    </>
  );
};

export default Home;
