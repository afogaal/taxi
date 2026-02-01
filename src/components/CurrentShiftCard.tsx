import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentShift } from "@/types/tracker";
import { formatTime } from "@/utils/timeUtils";
import { Clock, Play, Square, Timer, History, AlertCircle } from "lucide-react";

interface CurrentShiftCardProps {
	currentShift: CurrentShift | null;
	elapsedSeconds: number;
	remainingSeconds?: number;
	onStartShift: () => void;
	onStartShiftCustom: () => void;
	onEndShift: () => void;
	onCancelShift: () => void;
}

const secondsToHM = (seconds: number) => {
	const h = Math.floor(Math.max(0, seconds) / 3600);
	const m = Math.floor((Math.max(0, seconds) % 3600) / 60);
	return `${h}h ${m}m`;
};

const workingTimer = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function CurrentShiftCard({
	currentShift,
	elapsedSeconds,
	remainingSeconds = 0,
	onStartShift,
	onStartShiftCustom,
	onEndShift,
	onCancelShift,
}: CurrentShiftCardProps) {
	const isWarning = remainingSeconds < 3600;
	const isUrgent = remainingSeconds < 1800; // 30 mins

	const remainingClass =
		isUrgent ? "text-destructive animate-pulse"
		: isWarning ? "text-orange-500"
		: "text-emerald-500";

	return (
		<Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
			<CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
						<Timer className="h-4 w-4 text-primary" />
						Shift Control
					</CardTitle>
					<div
						className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase transition-colors ${
							currentShift ?
								"bg-emerald-500/10 text-emerald-500"
							:	"bg-muted text-muted-foreground"
						}`}
					>
						<span
							className={`h-1.5 w-1.5 rounded-full ${currentShift ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
						/>
						{currentShift ? "Live" : "Idle"}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-6">
				{currentShift ?
					<div className="space-y-6">
						{/* Massive Timer Display */}
						<div className="text-center space-y-1">
							<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
								Shift Duration
							</span>
							<div className="text-5xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm">
								{workingTimer(elapsedSeconds)}
							</div>
						</div>

						{/* Shift Stats Grid */}
						<div className="grid grid-cols-2 gap-3">
							<div className="p-3 bg-muted/40 rounded-2xl border border-border/50">
								<span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
									Started At
								</span>
								<div className="flex items-center gap-2 font-bold text-sm">
									<Clock className="h-3.5 w-3.5 text-primary" />
									{formatTime(currentShift.startTs)}
								</div>
							</div>
							<div className="p-3 bg-muted/40 rounded-2xl border border-border/50">
								<span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
									Remaining
								</span>
								<div
									className={`flex items-center gap-2 font-black text-sm ${remainingClass}`}
								>
									<AlertCircle className="h-3.5 w-3.5" />
									{secondsToHM(remainingSeconds)}
								</div>
							</div>
						</div>

						{/* Main Actions */}
						<div className="flex gap-3">
							<Button
								onClick={onEndShift}
								size="lg"
								className="flex-[2] h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-tight gap-2 shadow-lg shadow-destructive/20"
							>
								<Square className="h-4 w-4 fill-current" />
								End Shift
							</Button>
							<Button
								onClick={onCancelShift}
								size="lg"
								variant="outline"
								className="flex-1 h-14 rounded-2xl font-bold uppercase text-xs"
							>
								Cancel
							</Button>
						</div>
					</div>
				:	<div className="space-y-6 py-2">
						<div className="flex flex-col gap-3">
							<Button
								onClick={onStartShift}
								size="lg"
								className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-tight gap-2 shadow-lg shadow-primary/20"
							>
								<Play className="h-4 w-4 fill-current" />
								Start Shift Now
							</Button>
							<Button
								onClick={onStartShiftCustom}
								variant="ghost"
								className="h-10 rounded-xl font-bold text-muted-foreground hover:text-foreground gap-2"
							>
								<History className="h-4 w-4" />
								Use Custom Start Time
							</Button>
						</div>
					</div>
				}
			</CardContent>
		</Card>
	);
}
