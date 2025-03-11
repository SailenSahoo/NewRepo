import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import * as XLSX from "xlsx";
import "./styles.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ReporteeTable() {
  const [tableData, setTableData] = useState({});
  const [chartData, setChartData] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data/managers.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const tempTableData = {};
      const chartLabels = [];
      const bbData = [];
      const gheData = [];

      jsonData.forEach((row) => {
        const { "Managing Director": md, Reportees: reportee, "Total CSI": csi, "Total BB Repos": bb, "Total GHE Repos": ghe } = row;

        if (!tempTableData[md]) {
          tempTableData[md] = [];
          chartLabels.push(md);
          bbData.push(0);
          gheData.push(0);
        }
        tempTableData[md].push({ reportee, csi, bb, ghe });

        const mdIndex = chartLabels.indexOf(md);
        bbData[mdIndex] += bb;
        gheData[mdIndex] += ghe;
      });

      setTableData(tempTableData);
      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: "BB Repos",
            data: bbData,
            backgroundColor: "#8884d8",
          },
          {
            label: "GHE Repos",
            data: gheData,
            backgroundColor: "#82ca9d",
          },
        ],
      });
    };

    fetchData();
  }, []);

  const toggleExpand = (md) => {
    setExpanded((prev) => ({ ...prev, [md]: !prev[md] }));
  };

  return (
    <div className="container">
      <h2 className="title">Managing Directors and Reportees</h2>
      <table className="manager-table">
        <thead>
          <tr>
            <th>MD</th>
            <th>CSI</th>
            <th>BB Repos</th>
            <th>GHE Repos</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(tableData).map((md) => (
            <React.Fragment key={md}>
              <tr onClick={() => toggleExpand(md)} className="parent-row">
                <td>{expanded[md] ? "−" : "+"} {md}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              {expanded[md] &&
                tableData[md].map((reportee, index) => (
                  <tr key={index} className="child-row">
                    <td>{reportee.reportee}</td>
                    <td>{reportee.csi}</td>
                    <td>{reportee.bb}</td>
                    <td>{reportee.ghe}</td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="chart-container">
        <h3 className="chart-title">Managing Director Repo Chart</h3>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </div>
  );
}
