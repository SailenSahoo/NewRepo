import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

const Table = () => {
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({ L4: "", L5: "", L6: "" });
  const [filteredData, setFilteredData] = useState([]);

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

    const convertCounts = (node) => {
      node.projectCount = node.projectCount.size;
      node.csiCount = node.csiCount.size;
      if (node.children) {
        Object.values(node.children).forEach(convertCounts);
      }
    };
    Object.values(hierarchy).forEach(convertCounts);

    return hierarchy;
  };

  const handleFilterChange = (level, value) => {
    setFilters((prev) => ({ ...prev, [level]: value }));
  };

  const applyFilter = () => {
    const filtered = Object.entries(data).filter(([L4, L4Data]) =>
      L4.toLowerCase().includes(filters.L4.toLowerCase()) &&
      Object.keys(L4Data.children).some((L5) => L5.toLowerCase().includes(filters.L5.toLowerCase())) &&
      Object.values(L4Data.children).some((L5Data) =>
        Object.keys(L5Data.children).some((L6) => L6.toLowerCase().includes(filters.L6.toLowerCase()))
      )
    );
    setFilteredData(Object.fromEntries(filtered));
  };

  return (
    <div>
      <div className="filter-container">
        <input placeholder="Filter L4" onChange={(e) => handleFilterChange("L4", e.target.value)} />
        <input placeholder="Filter L5" onChange={(e) => handleFilterChange("L5", e.target.value)} />
        <input placeholder="Filter L6" onChange={(e) => handleFilterChange("L6", e.target.value)} />
        <button onClick={applyFilter}>Apply Filter</button>
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
          {Object.entries(filteredData.length ? filteredData : data).map(([L4, L4Data]) => (
            <tr key={L4}>
              <td>{L4}</td>
              <td>{L4Data.repoCount}</td>
              <td>{L4Data.projectCount}</td>
              <td>{L4Data.csiCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
