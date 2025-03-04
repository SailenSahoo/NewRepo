// App.js
import React, { useState } from "react";
import Dashboard2 from "./dashboard2.js";
import Dashboard from "./dashboard.js";
//import "./App.css";

function App() {
  const [selectedDashboard, setSelectedDashboard] = useState('B1'); // Default to Dashboard1

  const handleButtonClick = (dashboard) => {
    setSelectedDashboard(dashboard);
  };

  return (
    <div className="App">
      <h1 className="dashboard-title">Project Dashboard</h1>
      <div className="button-container">
        <button
          onClick={() => handleButtonClick('B1')}
          className={`dashboard-button ${selectedDashboard === 'B1' ? 'active' : ''}`}
        >
          B1
        </button>
        <button
          onClick={() => handleButtonClick('B2')}
          className={`dashboard-button ${selectedDashboard === 'B2' ? 'active' : ''}`}
        >
          B2
        </button>
      </div>
      <div className="dashboard-box">
        {selectedDashboard === 'B1' && <Dashboard />}
        {selectedDashboard === 'B2' && <Dashboard2 />}
      </div>
    </div>
  );
}

export default App;
