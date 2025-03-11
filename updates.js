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
        Object.values(MDData.children).map((child) => child.bbRepos)
      ),
    },
    {
      label: "GHE Repo Count",
      backgroundColor: "#36A2EB",
      data: Object.entries(data).flatMap(([_, MDData]) =>
        Object.values(MDData.children).map((child) => child.gheRepos)
      ),
    },
  ],
};


const chartOptions2 = {
  responsive: true,
  maintainAspectRatio: false,  // Allow the chart to stretch
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "BB/GHE Repo Count Per Reportee",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: 14,  // Increase the label size for better readability
        },
      },
    },
    x: {
      ticks: {
        font: {
          size: 12,  // Adjust as needed
        },
      },
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
