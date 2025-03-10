import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

const Table = () => {
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const [filter, setFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/data/managers.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const hierarchy = processData(sheet);
        setData(hierarchy);
        setFilteredData(hierarchy); // Initially set filtered data as full data
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

  const filterHierarchy = (node, query) => {
    const lowerQuery = query.toLowerCase();
    const filteredChildren = Object.fromEntries(
      Object.entries(node.children || {}).map(([childName, childNode]) => [childName, filterHierarchy(childNode, query)])
    );

    const hasMatchingChild = Object.keys(filteredChildren).length > 0;
    const isMatching = node && node.repoCount && node.name?.toLowerCase().includes(lowerQuery);

    if (isMatching || hasMatchingChild) {
      return { ...node, children: filteredChildren };
    }

    return null;
  };

  const expandFilteredRows = (node, query) => {
    const lowerQuery = query.toLowerCase();
    const filteredChildren = Object.fromEntries(
      Object.entries(node.children || {}).map(([childName, childNode]) => [childName, expandFilteredRows(childNode, query)])
    );

    const hasMatchingChild = Object.keys(filteredChildren).length > 0;
    const isMatching = node && node.repoCount && node.name?.toLowerCase().includes(lowerQuery);

    if (isMatching || hasMatchingChild) {
      return true;
    }

    return false;
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);

    if (!value) {
      setFilteredData(data);
      setExpandedRows({});
      return;
    }

    const filtered = Object.fromEntries(
      Object.entries(data).map(([manager, managerData]) => {
        const filteredManager = filterHierarchy(managerData, value);
        return filteredManager ? [manager, filteredManager] : null;
      }).filter(Boolean)
    );

    const newExpandedRows = {};
    Object.entries(data).forEach(([manager, managerData]) => {
      if (expandFilteredRows(managerData, value)) {
        newExpandedRows[manager] = true;
      }
    });

    setFilteredData(filtered);
    setExpandedRows(newExpandedRows);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by Manager Name"
        value={filter}
        onChange={handleFilterChange}
        className="filter-input"
      />
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
                  <React.Fragment key={L5}>
                    <tr className="sub-row">
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
                  </React.Fragment>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
