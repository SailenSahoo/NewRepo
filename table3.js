import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import "./styles.css";

export default function ReporteeTable() {
  const [tableData, setTableData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data/managers.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const tempTableData = {};
      const tempChartData = [];

      jsonData.forEach((row) => {
        const { "Managing Director": md, Reportees: reportee, "Total CSI": csi, "Total BB Repos": bb, "Total GHE Repos": ghe } = row;

        if (!tempTableData[md]) {
          tempTableData[md] = [];
          tempChartData.push({ md, bb: 0, ghe: 0 });
        }
        tempTableData[md].push({ reportee, csi, bb, ghe });

        const chartItem = tempChartData.find((item) => item.md === md);
        if (chartItem) {
          chartItem.bb += bb;
          chartItem.ghe += ghe;
        }
      });

      setTableData(tempTableData);
      setChartData(tempChartData);
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
        <BarChart width={600} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="md" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="bb" fill="#8884d8" name="BB Repos" />
          <Bar dataKey="ghe" fill="#82ca9d" name="GHE Repos" />
        </BarChart>
      </div>
    </div>
  );
}
