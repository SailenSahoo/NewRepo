import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

const Table = () => {
  const [data, setData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({ L4: "", L5: "", L6: "" });
  const [filteredData, setFilteredData] = useState({});

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

  const handleFilterChange = (level, value) => {
    setFilters((prev) => ({ ...prev, [level]: value }));
  };

  const applyFilters = () => {
    const filtered = Object.keys(data).reduce((acc, L4) => {
      if (filters.L4 && L4 !== filters.L4) return acc;
      const L4Data = data[L4];
      acc[L4] = { ...L4Data, children: {} };

      Object.keys(L4Data.children).forEach((L5) => {
        if (filters.L5 && L5 !== filters.L5) return;
        const L5Data = L4Data.children[L5];
        acc[L4].children[L5] = { ...L5Data, children: {} };

        Object.keys(L5Data.children).forEach((L6) => {
          if (filters.L6 && L6 !== filters.L6) return;
          acc[L4].children[L5].children[L6] = L5Data.children[L6];
        });
      });

      return acc;
    }, {});
    setFilteredData(filtered);
  };

  return (
    <div>
      <div className="filter-container">
        {["L4", "L5", "L6"].map((level) => (
          <select key={level} onChange={(e) => handleFilterChange(level, e.target.value)}>
            <option value="">Select {level} Manager</option>
            {Object.keys(data).map((manager) => (
              <option key={manager} value={manager}>{manager}</option>
            ))}
          </select>
        ))}
        <button onClick={applyFilters}>Apply Filter</button>
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
          {Object.entries(filteredData).map(([L4, L4Data]) => (
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
