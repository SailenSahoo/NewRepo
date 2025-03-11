import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "./style.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Table = () => {
  const [data, setData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/data/md_file.xlsx")
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

    rows.forEach(({ "Managing Director": MD, Reportees, "Total CSI": csi, "Total BB Repos": bbRepos, "Total GHE Repos": gheRepos }) => {
      if (!MD) return;

      if (!hierarchy[MD]) {
        hierarchy[MD] = { csi: 0, bbRepos: 0, gheRepos: 0, children: {} };
      }

      hierarchy[MD].csi += csi;
      hierarchy[MD].bbRepos += bbRepos;
      hierarchy[MD].gheRepos += gheRepos;

      if (Reportees) {
        hierarchy[MD].children[Reportees] = { csi, bbRepos, gheRepos };
      }
    });

    return hierarchy;
  };

  const toggleRow = (director) => {
    setExpandedRows((prev) => ({ ...prev, [director]: !prev[director] }));
  };

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: "BB Repo Count",
        backgroundColor: "#FF6384",
        data: Object.values(data).map((item) => item.bbRepos),
      },
      {
        label: "GHE Repo Count",
        backgroundColor: "#36A2EB",
        data: Object.values(data).map((item) => item.gheRepos),
      },
    ],
  };

  const chartData2 = {
    labels: Object.entries(data).flatMap(([MD, MDData]) =>Object.keys(MDData.children)
    ),
    datasets: [
      {
        label: "BB Repo Count",
        backgroundColor: "#FF6384",
        data: Object.entries(data).flatMap(([MD, MDData]) =>Object.values(MDData.children).map((child) => child.bbRepos)),
      },
      {
        label: "GHE Repo Count",
        backgroundColor: "#36A2EB",
        data: Object.entries(data).flatMap(([MD, MDData]) =>Object.values(MDData.children).map((child) => child.gheRepos)),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "BB/GHE Repo Count Per Managing Directors",
      },
    },
  };

  const chartOptions2 = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "BB/HE Repo Count Per Reportees of MD",
      },
    },
  };

  return (
    <div>
    <h3 className="heading-table">Status Overview of Managing Directors and Their Reportees</h3>
      <table className="manager-table">
        <thead>
          <tr>
            <th>Managing Director</th>
            <th>Total CSI</th>
            <th>Total BB Repos</th>
            <th>Total GHE Repos</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([MD, MDData]) => (
            <React.Fragment key={MD}>
              <tr>
                <td>
                  <button className="expand-btn" onClick={() => toggleRow(MD)}>
                    {expandedRows[MD] ? "−" : "+"}
                  </button>
                  {MD}
                </td>
                <td>{MDData.csi}</td>
                <td>{MDData.bbRepos}</td>
                <td>{MDData.gheRepos}</td>
              </tr>
              {expandedRows[MD] &&
                Object.entries(MDData.children).map(([reportee, reporteeData]) => (
                  <tr key={reportee} className="sub-row">
                    <td> └ {reportee}</td>
                    <td>{reporteeData.csi}</td>
                    <td>{reporteeData.bbRepos}</td>
                    <td>{reporteeData.gheRepos}</td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="chart-box2">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="chart-box2">
        <Bar data={chartData2} options={chartOptions2} />
      </div>
    </div>
  );
};

export default Table;
