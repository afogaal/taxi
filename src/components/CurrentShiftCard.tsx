import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentShift } from "@/types/tracker";
import { formatTime } from "@/utils/timeUtils";
import { Clock } from "lucide-react";

const secondsToHM = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
};

interface CurrentShiftCardProps {
	currentShift: CurrentShift | null;
	elapsedSeconds: number;
	remainingSeconds?: number;
	// NEW:
	busySeconds?: number;
	busyActive?: boolean;
	onToggleBusy?: () => void;

	onStartShift: () => void;
	onStartShiftCustom: () => void;
	onEndShift: () => void;
	onCancelShift: () => void;
}

export function CurrentShiftCard({
	currentShift,
	elapsedSeconds,
	remainingSeconds = 0,
	busySeconds = 0,
	busyActive = false,
	onToggleBusy,
	onStartShift,
	onStartShiftCustom,
	onEndShift,
	onCancelShift,
}: CurrentShiftCardProps) {
	const remainingClass =
		remainingSeconds < 3600
			? "text-red-500 font-semibold"
			: remainingSeconds < 2 * 3600
			? "text-yellow-500 font-semibold"
			: "text-muted-foreground";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Current Shift</CardTitle>
					<div className="flex items-center gap-2 text-sm">
						<Clock className="h-4 w-4" />
						<span className="font-medium">
							{currentShift ? "Running" : "Stopped"}
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{currentShift ? (
					<div className="space-y-4">
						{/* Times */}
						<div className="grid grid-cols-2 gap-3">
							<div className="p-3 bg-muted rounded-lg">
								<div className="text-xs text-muted-foreground mb-1">
									Started
								</div>
								<div className="text-sm font-medium">
									{formatTime(currentShift.startTs)}
								</div>
							</div>

							<div className="p-3 bg-muted rounded-lg">
								<div className="text-xs text-muted-foreground mb-1">
									Working
								</div>
								<div className="text-xl font-bold text-primary">
									{secondsToHM(elapsedSeconds)}
								</div>
								<div
									className={`text-xs mt-1 ${remainingClass}`}
								>
									Remaining: {secondsToHM(remainingSeconds)}
								</div>
							</div>
						</div>

						{/* End/Cancel */}
						<div className="flex gap-2">
							<Button
								onClick={onEndShift}
								variant="destructive"
								className="flex-1"
							>
								End Shift
							</Button>
							<Button onClick={onCancelShift} variant="outline">
								Cancel
							</Button>
						</div>
						{/* Busy toggle + busy timer */}
						<div className="flex items-center gap-2">
							<Button
								onClick={onToggleBusy}
								className={`flex-1 ${
									busyActive
										? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
										: "bg-green-600 hover:bg-green-600/90 text-white"
								}`}
							>
								{busyActive ? "Busy" : "Vacancy"}
							</Button>
							<div className="px-3 py-2 bg-muted rounded-lg text-sm">
								<div className="text-xs text-muted-foreground">
									Busy time
								</div>
								<div className="font-semibold">
									{secondsToHM(busySeconds)}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							No active shift. Start now or pick a custom start
							time.
						</p>
						<div className="flex gap-2">
							<Button
								onClick={onStartShift}
								className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
							>
								Start Shift Now
							</Button>
							<Button
								onClick={onStartShiftCustom}
								variant="outline"
							>
								Custom Start
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
