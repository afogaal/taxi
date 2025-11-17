import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface AddFareCardProps {
	fareInput: string;
	platform: string;
	onFareInputChange: (value: string) => void;
	onPlatformChange: (value: string) => void;
	onAddFare: () => void;
	disabled: boolean;
}

export function AddFareCard({
	fareInput,
	platform,
	onFareInputChange,
	onPlatformChange,
	onAddFare,
	disabled,
}: AddFareCardProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !disabled) {
			onAddFare();
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Fare</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
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

								<SelectItem value="Hailing">Hailing</SelectItem>
								<SelectItem value="Bolt">Bolt</SelectItem>
							</SelectContent>
						</Select>
					</div>

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
