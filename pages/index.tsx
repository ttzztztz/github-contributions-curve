import Head from "next/head";
import { Chart } from "@antv/g2";
import { useState } from "react";

const Home = () => {
  const [username, setUsername] = useState("");
  const renderChart = async () => {
    const resp = await fetch(`/api/${username}`);
    let { years, contributions } = await resp.json();

    const startDate = new Date(
      `${new Date().getFullYear() - 1}-${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${new Date().getDay().toString().padStart(2, "0")}`
    );

    contributions = contributions.filter(({ date }) => {
      const timestamp = new Date(date).getTime();
      return startDate.getTime() <= timestamp && timestamp <= Date.now();
    });
    console.log({ years, contributions });

    const chart = new Chart({
      container: "chart-area",
      autoFit: true,
      height: 500,
    });
    chart.data(contributions);

    chart.scale({
      date: {
        range: [0, 1],
      },
    });

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });

    chart.line().position("date*count");
    chart.render();
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
          <button onClick={() => renderChart()}>Generate</button>
        </div>
        <div id="chart-area"></div>
      </main>
    </>
  );
};

export default Home;
