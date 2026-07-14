import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface PlatformData {
	total: number;
	count: number;
}

interface ShiftHistory {
	id?: string;
	startTs: number;
	endTs: number;
	seconds: number;
	trips: number;
	earnings: number;
	busySeconds: number;
	platformSummary?: Record<string, PlatformData>;
}

interface ShiftHistoryCardProps {
	history: ShiftHistory[];
	onExportCSV: () => void;
	onClearHistory: () => void;
	onDeleteShift: (id: string) => void;
}

const secondsToHMString = (seconds: number) => {
	const safe = Math.max(0, seconds);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	return `${h}h ${m}m`;
};

const formatDate = (ts: number) =>
	format(new Date(ts), "yyyy-MM-dd");

const formatTimeOnly = (ts: number) =>
	format(new Date(ts), "HH:mm");


export function ShiftHistoryCard({
	history,
	onExportCSV,
	onClearHistory,
	onDeleteShift,
}: ShiftHistoryCardProps) {
	return (
		<div className="rounded-xl border p-4 space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-bold">
					Shift History
				</h2>

				<div className="flex gap-2">
					<Button onClick={onExportCSV}>
						Export CSV
					</Button>

					<Button
						variant="destructive"
						onClick={onClearHistory}
					>
						Clear
					</Button>
				</div>
			</div>

			{history.length === 0 ? (
				<p className="text-muted-foreground">
					No shifts recorded
				</p>
			) : (
				history.map((h) => (
					<div
						key={h.id ?? h.startTs}
						className="border rounded-lg p-3 space-y-1"
					>
						<div>
							{formatDate(h.startTs)}{" "}
							{formatTimeOnly(h.startTs)} -{" "}
							{formatTimeOnly(h.endTs)}
						</div>

						<div>
							Duration: {secondsToHMString(h.seconds)}
						</div>

						<div>
							Trips: {h.trips}
						</div>

						<div>
							Earnings: {h.earnings.toFixed(2)} kr
						</div>

						<div>
							Busy: {secondsToHMString(h.busySeconds)}
						</div>

						{h.id && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onDeleteShift(h.id!)}
							>
								Delete
							</Button>
						)}
					</div>
				))
			)}
		</div>
	);
}