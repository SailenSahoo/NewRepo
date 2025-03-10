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
        const hierarchy = processData(sheet);
        setData(hierarchy);
        setFilteredData(hierarchy);
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
    const filtered = Object.entries(data).filter(([L4, L4Data]) => {
      const matchL4 = !filters.L4 || L4.includes(filters.L4);
      const children = Object.entries(L4Data.children).filter(([L5]) =>
        !filters.L5 || L5.includes(filters.L5)
      );
      L4Data.children = Object.fromEntries(children);

      Object.values(L4Data.children).forEach((L5Data) => {
        const L6Children = Object.entries(L5Data.children).filter(([L6]) =>
          !filters.L6 || L6.includes(filters.L6)
        );
        L5Data.children = Object.fromEntries(L6Children);
      });

      return matchL4;
    });
    setFilteredData(Object.fromEntries(filtered));
  };

  const toggleRow = (manager) => {
    setExpandedRows((prev) => ({ ...prev, [manager]: !prev[manager] }));
  };

  return (
    <div>
      <div className="filter-container">
        <select onChange={(e) => handleFilterChange("L4", e.target.value)}>
          <option value="">Select L4 Manager</option>
          {Object.keys(data).map((L4) => (
            <option key={L4} value={L4}>{L4}</option>
          ))}
        </select>
        <select onChange={(e) => handleFilterChange("L5", e.target.value)}>
          <option value="">Select L5 Manager</option>
          {Object.values(data).flatMap((L4Data) => Object.keys(L4Data.children)).map((L5) => (
            <option key={L5} value={L5}>{L5}</option>
          ))}
        </select>
        <select onChange={(e) => handleFilterChange("L6", e.target.value)}>
          <option value="">Select L6 Manager</option>
          {Object.values(data).flatMap((L4Data) => Object.values(L4Data.children).flatMap((L5Data) => Object.keys(L5Data.children))).map((L6) => (
            <option key={L6} value={L6}>{L6}</option>
          ))}
        </select>
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
          {Object.entries(filteredData).map(([L4, L4Data]) => (
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
                  </>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
