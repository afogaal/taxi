import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrentShift, Fare } from "@/types/tracker";
import { Coins, Clock, Car, Edit2, Trash2, Target, Check } from "lucide-react";

interface SummaryCardProps {
	currentShift: CurrentShift | null;
	totalEarnings: number;
	elapsedSeconds: number;
	remainingTarget?: number;
	target?: number;
	onEditFare: (fare: Fare) => void;
	onDeleteFare: (fareId: string) => void;
	onTargetChange?: (newTarget: number) => void;
}

export function SummaryCard({
	currentShift,
	totalEarnings,
	elapsedSeconds,
	remainingTarget,
	target,
	onEditFare,
	onDeleteFare,
	onTargetChange,
}: SummaryCardProps) {
	const [isEditingTarget, setIsEditingTarget] = useState(false);
	const [tempTarget, setTempTarget] = useState(target?.toString() || "");

	const handleSaveTarget = () => {
		const newValue = Number(tempTarget);
		if (isNaN(newValue) || newValue <= 0) return;
		onTargetChange?.(newValue);
		setIsEditingTarget(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Top stats */}
				<div className="grid grid-cols-3 gap-3 text-center">
					<div className="p-3 bg-muted rounded-lg">
						<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
							<Car className="h-3 w-3" />
							<span>Trips</span>
						</div>
						<div className="text-lg font-semibold">
							{currentShift ? currentShift.trips : 0}
						</div>
					</div>

					<div className="p-3 bg-muted rounded-lg">
						<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
							<Coins className="h-3 w-3" />
							<span>Earnings</span>
						</div>
						<div className="text-lg font-semibold text-primary">
							{totalEarnings.toFixed(2)} kr
						</div>
					</div>

					<div className="p-3 bg-muted rounded-lg">
						<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
							<Clock className="h-3 w-3" />
							<span>Hours</span>
						</div>
						<div className="text-lg font-semibold">
							{currentShift
								? (elapsedSeconds / 3600).toFixed(2)
								: "0.00"}
						</div>
					</div>
				</div>

				{/* 🎯 Target info */}
				{typeof remainingTarget === "number" && (
					<div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-2">
						<div className="flex items-center gap-2">
							<Target className="h-3.5 w-3.5" />
							{isEditingTarget ? (
								<>
									<Input
										type="number"
										value={tempTarget}
										onChange={(e) =>
											setTempTarget(e.target.value)
										}
										className="h-6 w-20 text-xs"
									/>
									<Button
										size="sm"
										variant="ghost"
										onClick={handleSaveTarget}
										className="h-6 p-0 text-green-600"
									>
										<Check className="h-3 w-3" />
									</Button>
								</>
							) : (
								<>
									<span>Target: {target?.toFixed(0)} kr</span>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setIsEditingTarget(true)}
										className="h-6 p-0 text-muted-foreground"
									>
										<Edit2 className="h-3 w-3" />
									</Button>
								</>
							)}
						</div>
						<span
							className={
								remainingTarget <= 0
									? "text-green-600 font-semibold"
									: "text-primary font-semibold"
							}
						>
							Remain: {remainingTarget.toFixed(2)} kr
						</span>
					</div>
				)}

				{/* Fares list */}
				{currentShift && (
					<div>
						<div className="text-sm text-muted-foreground mb-2">
							Fares this shift (newest first)
						</div>
						<div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
							{currentShift.fares.length === 0 ? (
								<div className="text-xs text-muted-foreground text-center py-2 w-full">
									No fares yet
								</div>
							) : (
								currentShift.fares.map((fare) => (
									<div
										key={fare.id}
										className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md hover:bg-muted/80 transition-colors group text-xs"
									>
										<span className="font-medium">
											{fare.amount.toFixed(2)} kr
										</span>
										<span className="text-muted-foreground">
											{new Date(
												fare.timestamp
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
												hour12: false,
											})}
										</span>
										<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => onEditFare(fare)}
												className="h-5 w-5 p-0"
											>
												<Edit2 className="h-2.5 w-2.5" />
											</Button>
											<Button
												size="sm"
												variant="ghost"
												onClick={() =>
													onDeleteFare(fare.id)
												}
												className="h-5 w-5 p-0 hover:text-destructive"
											>
												<Trash2 className="h-2.5 w-2.5" />
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
