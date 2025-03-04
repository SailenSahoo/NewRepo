import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler } from "chart.js";
import "./Dashboard2.css"; // Import CSS file

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler);

const Dashboard2 = () => {
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data/excel_file2.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = jsonData.map(row => ({
        manager: row["L6 Managers"],
        LSE_1: row["LSE - 10/03/24"],
        Non_LSE_1: row["Non-Unify/Non-LSE - 10/03/24"],
        Unify_1: row["Unify - 10/03/24"],
        LSE_2: row["LSE - 01/20/25"],
        Non_LSE_2: row["Non-Unify/Non-LSE - 01/20/25"],
        Unify_2: row["Unify - 01/20/25"],
      }));

      setRawData(formattedData);
    };

    fetchData();
  }, []);

  const diffData = rawData.map(row => ({
    manager: row.manager,
    LSE_Diff: row.LSE_2 - row.LSE_1,
    Non_LSE_Diff: row.Non_LSE_2 - row.Non_LSE_1,
    Unify_Diff: row.Unify_2 - row.Unify_1,
  }));

  const getBarChartData = (keys, title) => ({
    labels: rawData.map(row => row.manager),
    datasets: keys.map((key, index) => ({
      label: key,
      data: rawData.map(row => row[key]),
      backgroundColor: ["#8884d8", "#82ca9d", "#ffc658"][index],
    })),
  });

  const getLineChartData = () => ({
    labels: diffData.map(row => row.manager),
    datasets: [
      {
        label: "LSE Difference",
        data: diffData.map(row => row.LSE_Diff),
        borderColor: "#ff7300",
        backgroundColor: "rgba(255, 115, 0, 0.4)",
        fill: true,
      },
      {
        label: "Non-Unify/Non-LSE Difference",
        data: diffData.map(row => row.Non_LSE_Diff),
        borderColor: "#0088FE",
        backgroundColor: "rgba(0, 136, 254, 0.4)",
        fill: true,
      },
      {
        label: "Unify Difference",
        data: diffData.map(row => row.Unify_Diff),
        borderColor: "#00C49F",
        backgroundColor: "rgba(0, 196, 159, 0.4)",
        fill: true,
      },
    ],
  });

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Repository Data Overview</h2>

      {rawData.length > 0 && (
        <>
          <div className="chart-row">
            <div className="chart-section">
              <h3>Repository Count on 10/03/24</h3>
              <Bar data={getBarChartData(["LSE_1", "Non_LSE_1", "Unify_1"], "Repository Count on 10/03/24")} options={{ responsive: true, plugins: { legend: { position: "top" } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
            </div>
            <div className="chart-section">
              <h3>Repository Count on 01/20/25</h3>
              <Bar data={getBarChartData(["LSE_2", "Non_LSE_2", "Unify_2"], "Repository Count on 01/20/25")} options={{ responsive: true, plugins: { legend: { position: "top" } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
            </div>
          </div>

          <div className="line-chart-section">
            <h3>Difference (01/20/25 - 10/03/24)</h3>
            <Line data={getLineChartData()} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>

          <div className="table-section">
            <h3>Raw Data Table</h3>
            <table border="1" cellPadding="5" className="data-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>LSE (10/03/24)</th>
                  <th>Non-Unify/Non-LSE (10/03/24)</th>
                  <th>Unify (10/03/24)</th>
                  <th>LSE (01/20/25)</th>
                  <th>Non-Unify/Non-LSE (01/20/25)</th>
                  <th>Unify (01/20/25)</th>
                  <th>LSE Diff</th>
                  <th>Non-Unify/Non-LSE Diff</th>
                  <th>Unify Diff</th>
                </tr>
              </thead>
              <tbody>
                {rawData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.manager}</td>
                    <td>{row.LSE_1}</td>
                    <td>{row.Non_LSE_1}</td>
                    <td>{row.Unify_1}</td>
                    <td>{row.LSE_2}</td>
                    <td>{row.Non_LSE_2}</td>
                    <td>{row.Unify_2}</td>
                    <td>{row.LSE_2 - row.LSE_1}</td>
                    <td>{row.Non_LSE_2 - row.Non_LSE_1}</td>
                    <td>{row.Unify_2 - row.Unify_1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard2;