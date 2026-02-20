interface PlatformData {
	total: number;
	count: number;
}

interface ShiftHistory {
	startTs: number;
	endTs: number;
	seconds: number;
	trips: number;
	earnings: number;
	busySeconds: number;
	platformSummary?: Record<string, PlatformData>;
}

const secondsToHMString = (seconds: number) => {
	const safe = Math.max(0, seconds);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	return `${h}h ${m}m`;
};
import { format } from "date-fns";

// Format full date, e.g. 2026-02-19
const formatDate = (ts: number) => format(new Date(ts), "yyyy-MM-dd");

// Format time only, e.g. 08:30
const formatTimeOnly = (ts: number) => format(new Date(ts), "HH:mm");

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
			h.platformSummary ?
				Object.entries(h.platformSummary)
					.filter(([, v]) => v.total > 0)
					.map(([name, data]) => `${name}: ${data.total.toFixed(0)}`)
					.join(" | ")
			:	"";

		return [
			formatDate(h.startTs),
			formatTimeOnly(h.startTs),
			formatTimeOnly(h.endTs),
			secondsToHMString(h.seconds),
			h.trips,
			h.earnings.toFixed(2),
			secondsToHMString(h.busySeconds),
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
