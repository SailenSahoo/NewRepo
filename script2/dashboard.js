import React, { useState, useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { readExcel } from "./Xlsx";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ L4: "", L5: "", L6: "", Pipeline: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    readExcel("/data/excel_file.xlsx").then((jsonData) => {
      setData(jsonData);
      setFilteredData(jsonData);
    });
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setFilteredData(
      data.filter(
        (item) =>
          (!filters.L4 || item["L4 Manager"] === filters.L4) &&
          (!filters.L5 || item["L5 Manager"] === filters.L5) &&
          (!filters.L6 || item["L6 Manager"] === filters.L6) &&
          (!filters.Pipeline || item["Pipeline"] === filters.Pipeline)
      )
    );
    setCurrentPage(1);
  };

  const projectCountByL6 = filteredData.reduce((acc, curr) => {
    acc[curr["L6 Manager"]] = (acc[curr["L6 Manager"]] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(projectCountByL6),
    datasets: [
      {
        label: "Projects by L6 Manager",
        data: Object.values(projectCountByL6),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        fill: true,
        tension: 0.4,
        pointStyle: "circle",
        pointRadius: 5,
      },
    ],
  };

  const pipelineDistribution = filteredData.reduce((acc, curr) => {
    acc[curr["Pipeline"]] = (acc[curr["Pipeline"]] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(pipelineDistribution),
    datasets: [
      {
        label: "Pipeline Distribution",
        data: Object.values(pipelineDistribution),
        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28"],
      },
    ],
  };

  const appIdCountByL6 = filteredData.reduce((acc, curr) => {
    acc[curr["L6 Manager"]] = (acc[curr["L6 Manager"]] || 0) + 1;
    return acc;
  }, {});

  const appIdBarChartData = {
    labels: Object.keys(appIdCountByL6),
    datasets: [
      {
        label: "App ID Count by L6 Manager",
        data: Object.values(appIdCountByL6),
        backgroundColor: "#DEB887",
      },
    ],
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="dashboard-container">
      <div className="filters-box-dark">
        <div className="filters-grid">
          <select name="L4" onChange={handleFilterChange} className="filter-select">
            <option value="">Select L4</option>
            {[...new Set(data.map((d) => d["L4 Manager"]))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select name="L5" onChange={handleFilterChange} className="filter-select">
            <option value="">Select L5</option>
            {[...new Set(data.map((d) => d["L5 Manager"]))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select name="L6" onChange={handleFilterChange} className="filter-select">
            <option value="">Select L6</option>
            {[...new Set(data.map((d) => d["L6 Manager"]))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select name="Pipeline" onChange={handleFilterChange} className="filter-select">
            <option value="">Select Pipeline</option>
            {[...new Set(data.map((d) => d["Pipeline"]))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button onClick={applyFilters} className="apply-filters-button-blue">
            Apply Filters
          </button>
        </div>
      </div>
      <div className="charts-box">
        <div className="chart-grid">
          <div className="chart-container">
            <h2 className="chart-heading">Projects by L6 Manager</h2>
            {/* <Line data={lineChartData} options={{ maintainAspectRatio: false }} /> */}
            <div className="line-chart">
                <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>
          {/* <div className="doughnut-chart"> */}
          <div className="chart-container">
            <h2 className="chart-heading">Pipeline Distribution</h2>
            {/* <Doughnut data={pieChartData} options={{ maintainAspectRatio: false }} /> */}
            <div className="doughnut-chart">
                <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="app-id-bar-chart-container"> */}
      <div className="app-id-bar-chart-container">
        {/* <h2 className="chart-heading">App ID Count by L6 Manager</h2> */}
        <h2 className="chart-heading">App ID Count by L6 Manager</h2>
        <div className="bar-chart">
            <Bar data={appIdBarChartData} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>
      <div className="table-box">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="table-header-blue">
                <th className="table-cell">L4 Manager</th>
                <th className="table-cell">L5 Manager</th>
                <th className="table-cell">L6 Manager</th>
                <th className="table-cell">App ID</th>
                <th className="table-cell">Project Key</th>
                <th className="table-cell">Repo Name</th>
                <th className="table-cell">Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((item, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{item["L4 Manager"]}</td>
                  <td className="table-cell">{item["L5 Manager"]}</td>
                  <td className="table-cell">{item["L6 Manager"]}</td>
                  <td className="table-cell">{item["App ID"]}</td>
                  <td className="table-cell">{item["Project Key"]}</td>
                  <td className="table-cell">{item["Repo Name"]}</td>
                  <td className="table-cell">{item["Pipeline"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button-blue"
            >
              Previous
            </button>
            <span className="pagination-text">Total Records: {filteredData.length}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastRow >= filteredData.length}
              className="pagination-button-blue"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;