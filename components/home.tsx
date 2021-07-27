import Head from "next/head";
import { Chart } from "@antv/g2";
import { useEffect, useState } from "react";
import processContributions from "../lib/process";
import { IPreparedContributions } from "../lib/types";
import { IHomeProps } from "../models/home";

const classnames = (...props: string[]) => {
  return props.join(" ");
};

const drawLine = (
  preparedContribtuions: IPreparedContributions[],
  animation: boolean = true
) => {
  const [firstContribution, lastContribution] = [
    preparedContribtuions[0],
    preparedContribtuions[preparedContribtuions.length - 1],
  ];

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
  if (!animation) chart.animate(false);

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
    padding: [20, 60, 40, 60],
  });

  if (!animation) view1.animate(false);
  view1.data(preparedContribtuions);
  view1.interaction("tooltip");
  view1.interaction("sibling-tooltip");
  view1.area().position("date*index").color("#4FAAEB");
  view1.annotation().dataMarker({
    top: true,
    position: [lastContribution.date, lastContribution.index],
    text: {
      content: `${lastContribution.index}`,
    },
    line: {
      length: 30,
    },
  });
  view1.annotation().dataMarker({
    top: true,
    position: [firstContribution.date, firstContribution.index],
    text: {
      content: `${firstContribution.index}`,
    },
    line: {
      length: 30,
    },
  });

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
    padding: [0, 60, 40, 60],
  });
  if (!animation) view1.animate(false);
  view2.interaction("tooltip");
  view2.interaction("sibling-tooltip");
  view2.data(preparedContribtuions);
  view2.line().position("date*delta").color("#9AD681");
  view2.annotation().dataMarker({
    top: true,
    position: [lastContribution.date, lastContribution.delta],
    text: {
      content: `${lastContribution.delta}`,
    },
    line: {
      length: 30,
    },
  });
  view2.annotation().dataMarker({
    top: true,
    position: [firstContribution.date, firstContribution.delta],
    text: {
      content: `${firstContribution.delta}`,
    },
    line: {
      length: 30,
    },
  });

  chart.render();

  window.dispatchEvent(new Event("rendergraph"));
  return chart;
};

export const Home = ({
  initialUsername,
  initialTimeWindow,
  initialData,
  preRender,
}: IHomeProps) => {
  const [username, setUsername] = useState(preRender ? initialUsername : "");
  const [timeWindow, setTimeWindow] = useState(
    preRender ? initialTimeWindow : "3m"
  );

  const [chartInstance, setChartInstance] = useState<null | Chart>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDelta, setCurrentDelta] = useState(0);
  const [indexClassName, setIndexClassName] = useState("index-black");
  const [currentRange, setCurrentRange] = useState("");

  const renderChart = (
    { years, contributions }: any,
    animation: boolean = true
  ) => {
    const preparedContribtuions = processContributions(
      contributions,
      timeWindow
    );
    console.log({ years, contributions, preparedContribtuions });

    const chart = drawLine(preparedContribtuions, animation);
    setChartInstance(chart);
    const len = preparedContribtuions.length;
    if (len >= 2) {
      const [prevContribution, lastContribution] = [
        preparedContribtuions[0],
        preparedContribtuions[len - 1],
      ];
      setCurrentIndex(lastContribution.index);
      setCurrentDelta(
        (100.0 * (lastContribution.index - prevContribution.index)) /
          prevContribution.index
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
  const fetchChart = async (timeWindow: string) => {
    chartInstance?.destroy();

    const resp = await fetch(`/api/${username}?window=${timeWindow}`);
    const { years, contributions } = await resp.json();

    renderChart({ years, contributions });
  };

  useEffect(() => {
    if (preRender) {
      console.log("pre_render", {
        initialUsername,
        initialTimeWindow,
        initialData,
      });
      setUsername(initialUsername);
      setTimeWindow(initialTimeWindow);

      renderChart(initialData, false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Github Contributions Chart</title>
      </Head>
      <main>
        {!preRender && (
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
              <option value="1m">1 Month</option>
              <option value="2m">2 Months</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
            </select>
            <button id="generate" onClick={() => fetchChart(timeWindow)}>
              Generate
            </button>
            <button
              onClick={() => window.open(`/image/${timeWindow}/${username}`)}
            >
              Link
            </button>
          </div>
        )}
        <div className={classnames("index", indexClassName)}>
          <span className="current-index">{currentIndex}pts</span>
          <span className="current-delta">
            {currentDelta > 0 ? "+" : ""}
            {currentDelta.toFixed(2)}%
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
