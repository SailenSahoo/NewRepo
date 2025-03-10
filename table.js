import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

const Table = () => {
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [l4Filter, setL4Filter] = useState("");
  const [l5Filter, setL5Filter] = useState("");
  const [l6Filter, setL6Filter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetch("/data/managers.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const processedData = processData(sheet);
        setData(processedData);
        setFilteredData(processedData);
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

  const applyFilter = () => {
    const filtered = Object.entries(data).reduce((acc, [L4, L4Data]) => {
      if (L4.toLowerCase().includes(l4Filter.toLowerCase())) {
        const filteredChildren = Object.entries(L4Data.children).reduce((childAcc, [L5, L5Data]) => {
          if (L5.toLowerCase().includes(l5Filter.toLowerCase())) {
            const filteredGrandChildren = Object.entries(L5Data.children).reduce((grandChildAcc, [L6, L6Data]) => {
              if (L6.toLowerCase().includes(l6Filter.toLowerCase())) {
                grandChildAcc[L6] = L6Data;
              }
              return grandChildAcc;
            }, {});
            childAcc[L5] = { ...L5Data, children: filteredGrandChildren };
          }
          return childAcc;
        }, {});
        acc[L4] = { ...L4Data, children: filteredChildren };
      }
      return acc;
    }, {});
    setFilteredData(filtered);
  };

  const toggleRow = (manager) => {
    setExpandedRows((prev) => ({ ...prev, [manager]: !prev[manager] }));
  };

  return (
    <div>
      <div className="filter-container">
        <input placeholder="Filter L4 Managers" value={l4Filter} onChange={(e) => setL4Filter(e.target.value)} />
        <input placeholder="Filter L5 Managers" value={l5Filter} onChange={(e) => setL5Filter(e.target.value)} />
        <input placeholder="Filter L6 Managers" value={l6Filter} onChange={(e) => setL6Filter(e.target.value)} />
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
            <React.Fragment key={L4}>
              <tr>
                <td>
                  <button onClick={() => toggleRow(L4)}>{expandedRows[L4] ? "−" : "+"}</button>
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
                        <button onClick={() => toggleRow(L5)}>{expandedRows[L5] ? "−" : "+"}</button>
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
