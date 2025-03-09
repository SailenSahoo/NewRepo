import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

const Table = () => {
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    // Load and parse the Excel file
    fetch("/data/managers.xlsx") // Ensure this matches your file name
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        setData(processData(sheet));
      })
      .catch((error) => console.error("Error loading Excel:", error));
  }, []);

  // Process data to group repositories, projects, and CSI IDs under each manager level
  const processData = (rows) => {
    const hierarchy = {};
    
    rows.forEach(({ "L4 Manager": L4, "L5 Manager": L5, "L6 Manager": L6, repositories, projects, "CSI ID": csiId }) => {
      if (!hierarchy[L4]) hierarchy[L4] = { repoCount: 0, projectCount: new Set(), csiCount: new Set(), children: {} };
      hierarchy[L4].repoCount += 1;
      hierarchy[L4].projectCount.add(projects);
      hierarchy[L4].csiCount.add(csiId);

      if (L5) {
        if (!hierarchy[L4].children[L5]) hierarchy[L4].children[L5] = { repoCount: 0, projectCount: new Set(), csiCount: new Set(), children: {} };
        hierarchy[L4].children[L5].repoCount += 1;
        hierarchy[L4].children[L5].projectCount.add(projects);
        hierarchy[L4].children[L5].csiCount.add(csiId);

        if (L6) {
          if (!hierarchy[L4].children[L5].children[L6]) hierarchy[L4].children[L5].children[L6] = { repoCount: 0, projectCount: new Set(), csiCount: new Set() };
          hierarchy[L4].children[L5].children[L6].repoCount += 1;
          hierarchy[L4].children[L5].children[L6].projectCount.add(projects);
          hierarchy[L4].children[L5].children[L6].csiCount.add(csiId);
        }
      }
    });

    // Convert Sets to counts
    const convertCounts = (node) => {
      node.projectCount = node.projectCount.size;
      node.csiCount = node.csiCount.size;
      Object.values(node.children).forEach(convertCounts);
    };
    Object.values(hierarchy).forEach(convertCounts);

    return hierarchy;
  };

  // Toggle expansion of a row
  const toggleRow = (manager) => {
    setExpandedRows((prev) => ({ ...prev, [manager]: !prev[manager] }));
  };

  return (
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
          <>
            <tr key={L4}>
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
                <>
                  <tr key={L5} className="sub-row">
                    <td>
                      <button className="expand-btn" onClick={() => toggleRow(L5)}>
                        {expandedRows[L5] ? "−" : "+"}
                      </button>
                      └ {L5}
                    </td>
                    <td>{L5Data.repoCount}</td>
                    <td>{L5Data.projectCount}</td>
                    <td>{L5Data.csiCount}</td>
                  </tr>
                  {expandedRows[L5] &&
                    Object.entries(L5Data.children).map(([L6, L6Data]) => (
                      <tr key={L6} className="sub-sub-row">
                        <td> └── {L6}</td>
                        <td>{L6Data.repoCount}</td>
                        <td>{L6Data.projectCount}</td>
                        <td>{L6Data.csiCount}</td>
                      </tr>
                    ))}
                </>
              ))}
          </>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
