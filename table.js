import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import "./styles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const Table = () => {
  const [data, setData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/data/managers.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        setData(processData(sheet));
      })
      .catch((error) => console.error("Error loading Excel:", error));
  }, []);

  const processData = (rows) => {
    const hierarchy = {};

    rows.forEach(({ "L4 Manager": L4, "L5 Manager": L5, "L6 Manager": L6, repositories, projects, "CSI ID": csiId }) => {
      if (!L4) return;

      if (!hierarchy[L4]) {
        hierarchy[L4] = { repoCount: 0, projectCount: new Set(), csiCount: new Set(), children: {} };
      }
      hierarchy[L4].repoCount += 1;
      if (projects) hierarchy[L4].projectCount.add(projects);
      if (csiId) hierarchy[L4].csiCount.add(csiId);

      if (L5) {
        if (!hierarchy[L4].children[L5]) {
          hierarchy[L4].children[L5] = { repoCount: 0, projectCount: new Set(), csiCount: new Set(), children: {} };
        }
        hierarchy[L4].children[L5].repoCount += 1;
        if (projects) hierarchy[L4].children[L5].projectCount.add(projects);
        if (csiId) hierarchy[L4].children[L5].csiCount.add(csiId);

        if (L6) {
          if (!hierarchy[L4].children[L5].children[L6]) {
            hierarchy[L4].children[L5].children[L6] = { repoCount: 0, projectCount: new Set(), csiCount: new Set() };
          }
          hierarchy[L4].children[L5].children[L6].repoCount += 1;
          if (projects) hierarchy[L4].children[L5].children[L6].projectCount.add(projects);
          if (csiId) hierarchy[L4].children[L5].children[L6].csiCount.add(csiId);
        }
      }
    });

    const convertCounts = (node) => {
      if (!node) return;

      if (node.projectCount instanceof Set) {
        node.projectCount = node.projectCount.size;
      }

      if (node.csiCount instanceof Set) {
        node.csiCount = node.csiCount.size;
      }

      if (node.children && typeof node.children === "object") {
        Object.values(node.children).forEach(convertCounts);
      }
    };

    Object.values(hierarchy).forEach(convertCounts);

    return hierarchy;
  };

  const toggleRow = (manager) => {
    setExpandedRows((prev) => ({ ...prev, [manager]: !prev[manager] }));
  };

  // Prepare data for charts
  const getChartData = () => {
    const l5Managers = [];
    const repoCounts = [];
    const projectCounts = [];

    Object.values(data).forEach((l4Data) => {
      Object.entries(l4Data.children).forEach(([l5, l5Data]) => {
        l5Managers.push(l5);
        repoCounts.push(l5Data.repoCount);
        projectCounts.push(l5Data.projectCount);
      });
    });

    return { l5Managers, repoCounts, projectCounts };
  };

  const { l5Managers, repoCounts, projectCounts } = getChartData();

  const barData = {
    labels: l5Managers,
    datasets: [
      {
        label: "Repo Count",
        data: repoCounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: l5Managers,
    datasets: [
      {
        label: "Unique Projects",
        data: projectCounts,
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <div className="chart-container">
        <div className="chart-box">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        <div className="chart-box">
          <Line data={lineData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>
      <table className="manager-table">
        <thead>
          <tr>
            <th>Manager</th>
            <th>Repo Count</th>
            <th>Project Count</th>
            <th>CSI ID Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([L4, L4Data]) => (
            <React.Fragment key={L4}>
              <tr>
                <td>
                  <button className="expand-btn" onClick={() => toggleRow(L4)}>
                    {expandedRows[L4] ? "−" : "+"}
                  </button>
                  {L4}
                </td>
                <td>{L4Data.repoCount}</td>
                <td>{L4Data.projectCount}</td>
                <td>{L4Data.csiCount}</td>
              </tr>
              {expandedRows[L4] &&
                Object.entries(L4Data.children).map(([L5, L5Data]) => (
                  <tr key={L5} className="sub-row">
                    <td> └ {L5}</td>
                    <td>{L5Data.repoCount}</td>
                    <td>{L5Data.projectCount}</td>
                    <td>{L5Data.csiCount}</td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
