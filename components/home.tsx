import Head from "next/head";
import { Chart } from "@antv/g2";
import { useEffect, useState } from "react";
import processContributions from "../lib/process";
import { IPreparedContributions } from "../lib/types";
import { IHomeProps } from "../models/home";

const classnames = (...props: string[]) => {
  return props.join(" ");
};

const drawLine = (preparedContribtuions: IPreparedContributions[]) => {
  const chart = new Chart({
    container: "chart-area",
    autoFit: true,
    height: 500,
    defaultInteractions: [],
  });
  chart.tooltip({
    showCrosshairs: true,
  });
  chart.removeInteraction("tooltip");
  chart.scale("date", {
    sync: true,
    tickCount: 5,
    range: [0, 1],
  });

  const view1 = chart.createView({
    region: {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 1,
        y: 0.7,
      },
    },
    padding: [10, 10, 40, 60],
  });
  view1.animate(false);
  view1.data(preparedContribtuions);
  view1.interaction("tooltip");
  view1.interaction("sibling-tooltip");
  view1.area().position("date*index").color("#4FAAEB");

  const view2 = chart.createView({
    region: {
      start: {
        x: 0,
        y: 0.75,
      },
      end: {
        x: 1,
        y: 1,
      },
    },
    padding: [0, 10, 40, 60],
  });
  view2.interaction("tooltip");
  view2.interaction("sibling-tooltip");
  view2.data(preparedContribtuions);
  view2.line().position("date*delta").color("#9AD681");
  chart.render();
  return chart;
};

export const Home = ({
  initialUsername,
  initialTimeWindow,
  preRender,
}: IHomeProps) => {
  const [username, setUsername] = useState(preRender ? initialUsername : "");
  const [timeWindow, setTimeWindow] = useState(preRender ? initialTimeWindow : "2");

  const [chartInstance, setChartInstance] = useState<null | Chart>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDelta, setCurrentDelta] = useState(0);
  const [indexClassName, setIndexClassName] = useState("index-black");
  const [currentRange, setCurrentRange] = useState("");

  const renderChart = async () => {
    chartInstance?.destroy();

    const resp = await fetch(`/api/${username}`);
    const { years, contributions } = await resp.json();

    const preparedContribtuions = processContributions(
      contributions,
      +timeWindow
    );
    console.log({ years, contributions, preparedContribtuions });

    const chart = drawLine(preparedContribtuions);
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
      setCurrentRange(`${prevContribution.date}~${lastContribution.date}`);

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

  useEffect(() => {
    if (preRender) {
      console.log("pre_render", { initialUsername, initialTimeWindow });
      setUsername(initialUsername);
      setTimeWindow(initialTimeWindow);

      renderChart();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Github Contributions Chart</title>
      </Head>
      <main>
        <div className="control-container">
          <input
            id="username"
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
            id="time-window"
          >
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="5">5 Years</option>
          </select>
          <button id="generate" onClick={() => renderChart()}>
            Generate
          </button>
        </div>
        <div className={classnames("index", indexClassName)}>
          <span className="current-index">{currentIndex}pts</span>
          <span className="current-delta">
            {currentDelta > 0 ? "+" : ""}
            {currentDelta}%
          </span>
        </div>
        <div className="range">{currentRange}</div>
        <div id="chart-area"></div>

        <footer>
          <a
            href="https://github.com/ttzztztz/github-contributions-curve"
            target="_blank"
          >
            Github
          </a>
        </footer>
      </main>
    </>
  );
};
