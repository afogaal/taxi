import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const secondsToHM = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
};

interface AddFareCardProps {
	fareInput: string;
	platform: string;
	onFareInputChange: (value: string) => void;
	onPlatformChange: (value: string) => void;
	onAddFare: () => void;
	disabled: boolean;

	// NEW for busy tracking
	busySeconds?: number;
	busyActive?: boolean;
	onToggleBusy?: () => void;
}

export function AddFareCard({
	fareInput,
	platform,
	onFareInputChange,
	onPlatformChange,
	onAddFare,
	disabled,
	busySeconds = 0,
	busyActive = false,
	onToggleBusy,
}: AddFareCardProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !disabled) {
			onAddFare();
		}
	};

	return (
		<Card>
			<CardHeader>
				{/* Busy / Vacancy toggle + busy time */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						onClick={onToggleBusy}
						disabled={disabled || !onToggleBusy}
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
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{/* Amount + platform */}
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

					{/* Add fare */}
					<Button
						onClick={onAddFare}
						disabled={disabled}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Fare
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
