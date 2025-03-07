import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./Dashboard2.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard2 = () => {
  const [rawData, setRawData] = useState([]);
  const [yAxisMax, setYAxisMax] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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
      const maxVal = Math.max(...formattedData.flatMap(row => [row.LSE_1, row.Non_LSE_1, row.Unify_1, row.LSE_2, row.Non_LSE_2, row.Unify_2]));
      setYAxisMax(Math.ceil(maxVal / 10) * 10);
    };

    fetchData();
  }, []);

  const getBarChartData = (keys) => ({
    labels: rawData.map(row => row.manager),
    datasets: keys.map((key, index) => ({
      label: key.replace(/_1|_2/, ""),
      data: rawData.map(row => row[key]),
      backgroundColor: ["#8884d8", "#82ca9d", "#ffc658"][index],
    })),
  });

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        title: { display: true, text: "Repository Count" },
      },
    },
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = rawData.slice(indexOfFirstRecord, indexOfLastRecord);

  const nextPage = () => {
    if (indexOfLastRecord < rawData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="dashboard-container">
      {rawData.length > 0 && (
        <>
          <div className="chart-row">
            <div className="chart-section">
              <h3>Repository Count on 10/03/24</h3>
              <Bar data={getBarChartData(["LSE_1", "Non_LSE_1", "Unify_1"])} options={chartOptions} />
            </div>
            <div className="chart-section">
              <h3>Repository Count on 01/20/25</h3>
              <Bar data={getBarChartData(["LSE_2", "Non_LSE_2", "Unify_2"])} options={chartOptions} />
            </div>
          </div>

          <div className="table-section">
            <h3>Raw Data Table</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>LSE (10/03/24)</th>
                  <th>Non-LSE (10/03/24)</th>
                  <th>Unify (10/03/24)</th>
                  <th>LSE (01/20/25)</th>
                  <th>Non-LSE (01/20/25)</th>
                  <th>Unify (01/20/25)</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((row, index) => (
                  <tr key={index}>
                    <td>{row.manager}</td>
                    <td>{row.LSE_1}</td>
                    <td>{row.Non_LSE_1}</td>
                    <td>{row.Unify_1}</td>
                    <td>{row.LSE_2}</td>
                    <td>{row.Non_LSE_2}</td>
                    <td>{row.Unify_2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">Previous</button>
              <span className="record-text">Total Records: {rawData.length}</span>
              <button onClick={nextPage} disabled={indexOfLastRecord >= rawData.length} className="pagination-button">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard2;
