// Helper: convert seconds to "8h 30m" string
const secondsToHMString = (seconds: number) => {
	const safe = Math.max(0, seconds);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	return `${h}h ${m}m`;
};

// Export CSV function
const onExportCSV = () => {
	if (!Array.isArray(history) || history.length === 0) return;

	// 1. Headers - proper labels for Excel
	const headers = [
		"Date",
		"Shift Start",
		"Shift End",
		"Shift Duration", // replaces "seconds"
		"Trips",
		"Earnings (kr)",
		"Busy Duration", // replaces "busy seconds"
		"Platform Summary",
	];

	// 2. Rows
	const rows = history.map((h) => {
		const platforms =
			h.platformSummary ?
				Object.entries(h.platformSummary)
					.filter(([, v]) => v.total > 0)
					.map(([name, data]) => `${name}: ${data.total.toFixed(0)}`)
					.join(" | ")
			:	"";

		return [
			formatDate(h.startTs), // e.g. "2026-02-19"
			formatTimeOnly(h.startTs), // e.g. "08:30"
			formatTimeOnly(h.endTs), // e.g. "17:00"
			secondsToHMString(h.seconds ?? 0), // e.g. "8h 30m"
			h.trips ?? 0,
			(h.earnings ?? 0).toFixed(2),
			secondsToHMString(h.busySeconds ?? 0), // e.g. "0h 45m"
			platforms,
		];
	});

	// 3. Build CSV content
	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
	].join("\n");

	// 4. Trigger download
	const blob = new Blob(["\uFEFF" + csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `Taxi_Shift_Report_${new Date().toISOString().split("T")[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
