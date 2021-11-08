import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import apiKey from "./ApiKey.js";
import "./App.css";

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChecked, setIsChecked] = useState([0]);
  const [graphData, setGraphData] = useState([]);
  const [prefecturesName, setPrefecturesName] = useState([]);

  useEffect(() => {
    fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
      headers: { "X-API-KEY": apiKey },
    })
      .then((res) => res.json())
      .then((data) => {
        setPrefecturesName(data.result);
        setIsLoaded(true);
      })
      .catch((error) => {
        setIsLoaded(true);
        setError(error);
      });
  }, []);

  const populationDatafetch = (prefCode) => {
    fetch(
      `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCode}`,
      {
        headers: { "X-API-KEY": apiKey },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const copyGraphData = Object.assign([], graphData).slice();
        const copyIsCheked = Object.assign([], isChecked).slice();
        const populationData = [];
        data.result.data[0].data.map((item) => populationData.push(item.value));
        if (copyIsCheked.includes(prefCode)) {
          //チェックなし→チェック有り
          //グラフのデータとなるgraphDataに人口数の配列をPush
          const arrayPopulation = [{ data: populationData }];
          const newGraphData = copyGraphData.push(arrayPopulation);
          setGraphData(newGraphData);
        } else {
          //チェック有り→チェック無し
          //グラフのデータとなるgraphDataからAPIで取得した人口数の要素を消す
          const newGraphData = copyGraphData.filter((item) => {
            return item !== populationData;
          });
          setGraphData(newGraphData);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  const isCheck = (prefCode) => {
    const manageIsCheckStatus = new Set(isChecked);
    //isCheckedのStatusを見てチェック済みか調べる
    if (manageIsCheckStatus.has(prefCode)) {
      manageIsCheckStatus.delete(prefCode);
    } else {
      manageIsCheckStatus.add(prefCode);
    }
    //isCheckedのstatus更新
    setIsChecked(manageIsCheckStatus);
    populationDatafetch(prefCode);
  };

  const options = {
    series: {
      data: graphData,
    },
    plotOptions: {
      series: {
        pointInterval: 5,
        pointStart: 1965,
      },
    },
    yAxis: {
      title: {
        text: "人口数",
      },
    },
    xAxis: {
      title: {
        rangeDescription: "年度",
      },
    },
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading</div>;
  } else {
    return (
      <div>
        <div>
          {Object.keys(prefecturesName).map((i) => (
            <div
              key={prefecturesName[i].prefCode}
              style={{ margin: "3px", display: "inline-flex" }}
            >
              <input
                type="checkbox"
                value={prefecturesName[i].prefCode}
                onChange={() => isCheck(prefecturesName[i].prefCode)}
              />
              {prefecturesName[i].prefName}
            </div>
          ))}
        </div>
        <div>
          {<HighchartsReact highcharts={Highcharts} options={options} />}
        </div>
      </div>
    );
  }
}

export default App;
