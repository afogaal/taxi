const onExportCSV = () => {
  if (!Array.isArray(history) || history.length === 0) return;

  // 1. Headers with friendly names
  const headers = [
    "Date",
    "Shift Start",
    "Shift End",
    "Shift Duration", // human-readable instead of raw seconds
    "Trips",
    "Earnings (kr)",
    "Busy Duration", // human-readable busy time
    "Platform Summary",
  ];

  // 2. Rows formatting
  const rows = history.map((h) => {
    const platforms = h.platformSummary
      ? Object.entries(h.platformSummary)
          .filter(([, v]) => v.total > 0)
          .map(([name, data]) => `${name}: ${data.total.toFixed(0)}`)
          .join(" | ")
      : "";

    return [
      formatDate(h.startTs),
      formatTimeOnly(h.startTs),
      formatTimeOnly(h.endTs),
      secondsToHM(h.seconds ?? 0),           // shift duration in hh:mm
      h.trips ?? 0,
      (h.earnings ?? 0).toFixed(2),
      secondsToHM(h.busySeconds ?? 0),      // busy duration in hh:mm
      platforms,
    ];
  });

  // 3. Build CSV content
  const csvContent = [
    headers.join(","), 
    ...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
  ].join("\n");

  // 4. Download CSV
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Taxi_Shift_Report_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
