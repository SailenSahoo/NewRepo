// Generate chart data for reportees with managers on Y-axis
const chartData2 = {
  labels: Object.entries(data).flatMap(([_, MDData]) =>
    Object.keys(MDData.children)
  ),
  datasets: [
    {
      label: "BB Repo Count",
      backgroundColor: "#FF6384",
      data: Object.entries(data).flatMap(([_, MDData]) =>
        Object.values(MDData.children).map((child) => child.bbRepos || 0)
      ),
    },
    {
      label: "GHE Repo Count",
      backgroundColor: "#36A2EB",
      data: Object.entries(data).flatMap(([_, MDData]) =>
        Object.values(MDData.children).map((child) => child.gheRepos || 0)
      ),
    },
  ],
};

const chartOptions2 = {
  indexAxis: "y", // Makes the chart horizontal
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "BB/GHE Repo Count Per Reportee",
    },
  },
};

//css

.chart-box2 {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px;
  height: 800px; /* Increased height for better visibility */
  padding: 10px;
  width: 95%; /* Slightly increased width */
  display: flex;
  justify-content: center;
  margin: auto;
  margin-bottom: 20px;
  overflow-y: auto; /* Enable vertical scroll if needed */
}
