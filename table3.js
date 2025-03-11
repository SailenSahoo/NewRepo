import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./styles.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Table = () => {
  const [data, setData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [reporteeChartData, setReporteeChartData] = useState({});

  useEffect(() => {
    fetch("/data/managers.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const processedData = processData(sheet);
        setData(processedData);

        const reporteeChart = createReporteeChart(processedData);
        setReporteeChartData(reporteeChart);
      })
      .catch((error) => console.error("Error loading Excel:", error));
  }, []);

  const processData = (rows) => {
    const hierarchy = {};

    rows.forEach(
      ({
        "Managing Director": MD,
        Reportees,
        "Total CSI": csi,
        "Total BB Repos": bbRepos,
        "Total GHE Repos": gheRepos,
      }) => {
        if (!MD) return;

        if (!hierarchy[MD]) {
          hierarchy[MD] = { csi: 0, bbRepos: 0, gheRepos: 0, children: {} };
        }

        hierarchy[MD].csi += csi || 0;
        hierarchy[MD].bbRepos += bbRepos || 0;
        hierarchy[MD].gheRepos += gheRepos || 0;

        if (Reportees) {
          hierarchy[MD].children[Reportees] = {
            csi: csi || 0,
            bbRepos: bbRepos || 0,
            gheRepos: gheRepos || 0,
          };
        }
      }
    );

    return hierarchy;
  };

  const createReporteeChart = (processedData) => {
    const reporteeLabels = [];
    const bbRepoCounts = [];
    const gheRepoCounts = [];

    Object.entries(processedData).forEach(([MD, MDData]) => {
      Object.entries(MDData.children).forEach(([reportee, repoData]) => {
        reporteeLabels.push(reportee);
        bbRepoCounts.push(repoData.bbRepos);
        gheRepoCounts.push(repoData.gheRepos);
      });
    });

    return {
      labels: reporteeLabels,
      datasets: [
        {
          label: "BB Repos (Reportees)",
          data: bbRepoCounts,
          backgroundColor: "#8884d8",
        },
        {
          label: "GHE Repos (Reportees)",
          data: gheRepoCounts,
          backgroundColor: "#82ca9d",
        },
      ],
    };
  };

  const toggleRow = (director) => {
    setExpandedRows((prev) => ({ ...prev, [director]: !prev[director] }));
  };

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: "BB Repo Count (MDs)",
        data: Object.values(data).map((item) => item.bbRepos),
        backgroundColor: "#8884d8",
      },
      {
        label: "GHE Repo Count (MDs)",
        data: Object.values(data).map((item) => item.gheRepos),
        backgroundColor: "#82ca9d",
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
        text: "Managing Directors' Repo Counts",
      },
    },
  };

  const reporteeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Reportees' Repo Counts",
      },
    },
  };

  return (
    <div>
      <h2>Managing Directors' Repo Chart</h2>
      <Bar data={chartData} options={chartOptions} />

      <h2>Reportees' Repo Chart</h2>
      <Bar data={reporteeChartData} options={reporteeChartOptions} />
    </div>
  );
};

export default Table;
