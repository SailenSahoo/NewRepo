const chartData2 = {
  labels: Object.entries(data).flatMap(([MD, MDData]) =>
    Object.keys(MDData.children).map((reportee) => `${MD} - ${reportee}`)
  ),
  datasets: [
    {
      label: "BB Repo Count",
      backgroundColor: "#FF6384",
      data: Object.entries(data).flatMap(([MD, MDData]) =>
        Object.values(MDData.children).map((child) => child.bbRepos || 0)
      ),
    },
    {
      label: "GHE Repo Count",
      backgroundColor: "#36A2EB",
      data: Object.entries(data).flatMap(([MD, MDData]) =>
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
      text: "BB/GHE Repo Count Per Reportee with Managing Director",
    },
  },
};
