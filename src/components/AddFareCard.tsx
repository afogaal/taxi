import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const secondsToHMS = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}h ${String(m).padStart(
		2,
		"0",
	)}m ${String(s).padStart(2, "0")}s`;
};

function parseMMSS(input: string) {
  const [m, s] = input.split(":").map(Number);
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

	// Busy tracking
	busySeconds: number;
	busyActive: boolean;
	onToggleBusy: () => void;

	// ✅ manual busy add (seconds)
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

	const handleAddManualBusy = () => {
		const seconds = parseHHMM(manualBusy);
		if (seconds === null) return;
		onSetBusySeconds(seconds);
		setManualBusy("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !disabled) {
			onAddFare();
		}
	};

	return (
		<Card>
			<CardHeader>
				{/* Busy / Vacancy */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						onClick={onToggleBusy}
						disabled={disabled}
						className={`flex-1 h-12 text-base font-semibold ${
							busyActive ?
								"bg-destructive hover:bg-destructive/90 text-destructive-foreground"
							:	"bg-green-600 hover:bg-green-600/90 text-white"
						}`}
					>
						{busyActive ? "Busy" : "Vacancy"}
					</Button>

					<div className="h-12 w-[110px] bg-muted rounded-lg flex flex-col items-center justify-center">
						<div className="text-[10px] text-muted-foreground">
							Busy Time
						</div>
						<div className="font-semibold text-sm">
							{secondsToHMS(busySeconds)}
						</div>
					</div>
				</div>
				{/* Manual busy input */}
				const [manualBusy, setManualBusy] = useState(""); // inside
				AddFareCard
				<Input
					placeholder="MM:SS"
					className="h-10 text-sm"
					value={manualBusy}
					onChange={(e) => setManualBusy(e.target.value)}
				/>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						const seconds = parseMMSS(manualBusy);
						onSetBusySeconds(seconds);
						setManualBusy("");
					}}
				>
					+ Add
				</Button>
			</CardHeader>

			<CardContent>
				<div className="flex flex-col gap-3">
					{/* Fare input */}
					<div className="flex gap-2">
						<Input
							value={fareInput}
							onChange={(e) => onFareInputChange(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Fare amount"
							type="number"
							min="0"
							step="0.01"
							className="w-[60%]"
							disabled={disabled}
						/>

						<Select
							value={platform}
							onValueChange={onPlatformChange}
							disabled={disabled}
						>
							<SelectTrigger className="w-[40%]">
								<SelectValue placeholder="Platform" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Uber">Uber</SelectItem>
								<SelectItem value="Bolt">Bolt</SelectItem>
								<SelectItem value="Hailing">Hailing</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						onClick={onAddFare}
						disabled={disabled}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Fare
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
