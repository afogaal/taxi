import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Clock, Zap, ZapOff } from "lucide-react";

const secondsToHMS = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h}h ${m}m ${s}s`;
};

function parseMMSS(input: string) {
	const parts = input.split(":");
	if (parts.length !== 2) return 0;
	const [m, s] = parts.map(Number);
	if (isNaN(m) || isNaN(s)) return 0;
	return m * 60 + s;
}

interface AddFareCardProps {
	fareInput: string;
	platform: string;
	onFareInputChange: (value: string) => void;
	onPlatformChange: (value: string) => void;
	onAddFare: () => void;
	disabled: boolean;
	busySeconds: number;
	busyActive: boolean;
	onToggleBusy: () => void;
	onSetBusySeconds: (seconds: number) => void;
}

export function AddFareCard({
	fareInput,
	platform,
	onFareInputChange,
	onPlatformChange,
	onAddFare,
	disabled,
	busySeconds,
	busyActive,
	onToggleBusy,
	onSetBusySeconds,
}: AddFareCardProps) {
	const [manualBusy, setManualBusy] = useState("");

	const handleManualBusyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/\D/g, "");
		if (value.length > 4) value = value.slice(0, 4);
		if (value.length >= 3) {
			value =
				value.slice(0, value.length - 2) +
				":" +
				value.slice(value.length - 2);
		}
		setManualBusy(value);
	};

	const handleAddManualBusy = () => {
		const seconds = parseMMSS(manualBusy);
		if (seconds > 0) {
			onSetBusySeconds(seconds);
			setManualBusy("");
		}
	};

	return (
		<Card className="border-none shadow-xl overflow-hidden bg-card">
			<CardContent className="p-5 space-y-6">
				{/* 1. Timer & Manual Add Row */}
				<div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/50">
					<div className="flex flex-col flex-1">
						<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
							<Clock className="h-3 w-3" /> Total Busy Time
						</span>
						<span className="text-xl font-black tabular-nums">
							{secondsToHMS(busySeconds)}
						</span>
					</div>

					<div className="flex items-center gap-2 bg-background p-2 rounded-xl border shadow-sm">
						<Input
							placeholder="00:00"
							className="h-8 w-14 text-xs text-center border-none focus-visible:ring-0 p-0 font-bold"
							value={manualBusy}
							onChange={handleManualBusyChange}
							disabled={disabled}
							type="tel"
						/>
						<Button
							size="sm"
							variant="secondary"
							className="h-8 px-3 text-[10px] font-black uppercase"
							onClick={handleAddManualBusy}
						>
							Add
						</Button>
					</div>
				</div>

				{/* 2. Fare & Platform Input Row */}
				<div className="space-y-3">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
								kr
							</span>
							<Input
								value={fareInput}
								onChange={(e) =>
									onFareInputChange(e.target.value)
								}
								onKeyDown={(e) =>
									e.key === "Enter" &&
									!disabled &&
									onAddFare()
								}
								placeholder="0.00"
								type="number"
								className="pl-10 h-14 text-lg font-bold bg-muted/20 border-2 focus:border-primary transition-all rounded-xl"
								disabled={disabled}
							/>
						</div>

						<Select
							value={platform}
							onValueChange={onPlatformChange}
							disabled={disabled}
						>
							<SelectTrigger className="w-[120px] h-14 font-bold border-2 rounded-xl bg-background">
								<SelectValue placeholder="Platform" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value="Uber"
									className="font-medium"
								>
									Uber
								</SelectItem>
								<SelectItem
									value="Bolt"
									className="font-medium"
								>
									Bolt
								</SelectItem>
								<SelectItem
									value="Hailing"
									className="font-medium"
								>
									Hailing
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* 3. Primary Action Buttons (Same Size) */}
				<div className="grid grid-cols-2 gap-3">
					<Button
						type="button"
						onClick={onToggleBusy}
						disabled={disabled}
						className={`h-16 rounded-2xl flex flex-col gap-1 transition-all active:scale-95 ${
							busyActive ?
								"bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
							:	"bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
						}`}
					>
						{busyActive ?
							<Zap className="h-5 w-5 fill-current" />
						:	<ZapOff className="h-5 w-5" />}
						<span className="text-xs font-black uppercase tracking-tighter">
							{busyActive ? "Stop Busy" : "Start Busy"}
						</span>
					</Button>

					<Button
						onClick={onAddFare}
						disabled={disabled || !fareInput}
						className="h-16 rounded-2xl flex flex-col gap-1 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-primary/90"
					>
						<Plus className="h-6 w-6 stroke-[3]" />
						<span className="text-xs font-black uppercase tracking-tighter">
							Add Fare
						</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
