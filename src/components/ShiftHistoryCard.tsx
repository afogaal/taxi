// Helper: convert seconds to "Xh Ym"
const secondsToHMString = (seconds: number) => {
  const safe = Math.max(0, seconds ?? 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return `${h}h ${m}m`;
};

// Helper: format numbers with thousands separator
const numberWithSep = (n: number) => n.toLocaleString();

// Helper: format date as YYYY-MM-DD
const formatDate = (ts: number) => new Date(ts).toLocaleDateString("sv-SE");

// Helper: format time as HH:MM
const formatTimeOnly = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Main CSV export function
const onExportCSV = (history: any[]) => {
  if (!Array.isArray(history) || history.length === 0) return;

  // 1️⃣ CSV headers
  const headers = [
    "Date",
    "Shift Start",
    "Shift End",
    "Shift Duration",
    "Trips",
    "Earnings (kr)",
    "Busy Duration",
    "Platform Summary",
  ];

  // 2️⃣ CSV rows
  const rows = history.map((h) => {
    // Platform summary string, e.g. "Uber: 500 | Bolt: 300"
    const platforms =
      h.platformSummary && Object.keys(h.platformSummary).length > 0
        ? Object.entries(h.platformSummary)
            .filter(([, v]) => (v?.total ?? 0) > 0)
            .map(([name, data]) => `${name}: ${numberWithSep(data.total ?? 0)}`)
            .join(" | ")
        : "None";

    return [
      formatDate(h.startTs ?? 0),
      formatTimeOnly(h.startTs ?? 0),
      formatTimeOnly(h.endTs ?? 0),
      secondsToHMString(h.seconds ?? 0),
      h.trips ?? 0,
      numberWithSep(h.earnings ?? 0),
      secondsToHMString(h.busySeconds ?? 0),
      platforms,
    ];
  });

  // 3️⃣ Build CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
  ].join("\n");

  // 4️⃣ Trigger download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Taxi_Shift_Report_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
