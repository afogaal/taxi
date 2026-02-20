const secondsToHMString = (seconds: number) => {
	const safe = Math.max(0, seconds ?? 0);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	return `${h}h ${m}m`;
};

const numberWithSep = (n: number) => n.toLocaleString();

const formatDate = (ts: number) => new Date(ts).toLocaleDateString("sv-SE");
const formatTimeOnly = (ts: number) =>
	new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface PlatformData {
	total?: number;
	count?: number;
}

interface ShiftHistory {
	startTs: number;
	endTs: number;
	seconds?: number;
	trips?: number;
	earnings?: number;
	busySeconds?: number;
	platformSummary?: Record<string, PlatformData>;
}

const onExportCSV = (history: ShiftHistory[]) => {
	if (!Array.isArray(history) || history.length === 0) return;

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

	const rows = history.map((h) => {
		const platforms =
			h.platformSummary && Object.keys(h.platformSummary).length > 0 ?
				Object.entries(h.platformSummary)
					.filter(([_, v]) => (v?.total ?? 0) > 0)
					.map(
						([name, data]) =>
							`${name}: ${numberWithSep(data?.total ?? 0)}`,
					)
					.join(" | ")
			:	"None";

		return [
			formatDate(h.startTs),
			formatTimeOnly(h.startTs),
			formatTimeOnly(h.endTs),
			secondsToHMString(h.seconds ?? 0),
			h.trips ?? 0,
			numberWithSep(h.earnings ?? 0),
			secondsToHMString(h.busySeconds ?? 0),
			platforms,
		];
	});

	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
	].join("\n");

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
