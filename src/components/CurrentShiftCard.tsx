import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
	Clock,
	Play,
	Square,
	Timer,
	History,
	AlertCircle,
	Lock,
	Delete,
	Calendar as CalendarIcon,
	ChevronLeft,
} from "lucide-react";

const MY_PIN = "0000";

// ========================
// HELPERS
// ========================

const formatDuration = (seconds: number) => {
	const safe = Math.max(0, seconds);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	const s = safe % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatRemaining = (seconds: number) => {
	const safe = Math.max(0, seconds);
	const h = Math.floor(safe / 3600);
	const m = Math.floor((safe % 3600) / 60);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ========================
// PIN MODAL
// ========================

function PinModal({
	isOpen,
	onClose,
	onSuccess,
	title,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	title: string;
}) {
	const [pin, setPin] = useState("");
	const [error, setError] = useState(false);

	const handleNumberClick = (num: string) => {
		if (pin.length < 4) {
			const newPin = pin + num;
			setPin(newPin);
			if (newPin.length === 4) {
				if (newPin === MY_PIN) {
					onSuccess();
					setPin("");
					onClose();
				} else {
					setError(true);
					setTimeout(() => {
						setPin("");
						setError(false);
					}, 500);
				}
			}
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => onClose()}>
			<DialogContent className="sm:max-w-[320px] rounded-[2rem] p-6 border-none bg-background/95 backdrop-blur-md shadow-2xl">
				<DialogHeader className="space-y-1 text-center">
					<div className="mx-auto p-2.5 bg-primary/10 rounded-full w-fit">
						<Lock
							className={`h-4 w-4 ${error ? "text-destructive animate-bounce" : "text-primary"}`}
						/>
					</div>
					<DialogTitle className="text-base font-black uppercase tracking-tight">
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className="flex justify-center gap-3 my-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className={`h-3 w-3 rounded-full border-2 transition-all ${pin.length > i ? "bg-primary border-primary scale-110" : "border-muted-foreground/20"} ${error ? "bg-destructive border-destructive" : ""}`}
						/>
					))}
				</div>

				<div className="grid grid-cols-3 gap-3">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<Button
							key={num}
							variant="ghost"
							className="h-12 text-xl font-bold rounded-xl hover:bg-primary/10"
							onClick={() => handleNumberClick(num.toString())}
						>
							{num}
						</Button>
					))}
					<div />
					<Button
						variant="ghost"
						className="h-12 text-xl font-bold rounded-xl"
						onClick={() => handleNumberClick("0")}
					>
						0
					</Button>
					<Button
						variant="ghost"
						className="h-12 rounded-xl"
						onClick={() => setPin(pin.slice(0, -1))}
					>
						<Delete className="h-5 w-5" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// MAIN COMPONENT
// ========================

export function CurrentShiftCard({
	currentShift,
	elapsedSeconds,
	remainingSeconds = 0,
	onStartShift,
	onStartShiftCustom,
	onEndShift,
	onCancelShift,
}: any) {
	const [pinConfig, setPinConfig] = useState<any>({
		isOpen: false,
		action: null,
		title: "",
	});
	const [showCustomPicker, setShowCustomPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date(),
	);
	const [selectedTime, setSelectedTime] = useState(
		format(new Date(), "HH:mm"),
	);

	const handleConfirmCustom = () => {
		if (!selectedDate) return;
		const [hours, minutes] = selectedTime.split(":").map(Number);
		const finalDate = new Date(selectedDate);
		finalDate.setHours(hours, minutes, 0, 0);
		onStartShiftCustom(finalDate.getTime());
		setShowCustomPicker(false);
	};

	const isUrgent = remainingSeconds < 1800;
	const isWarning = remainingSeconds < 3600;

	return (
		<>
			<Card className="border-none shadow-xl overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
				<CardHeader className="py-2.5 border-b border-border/40 bg-muted/30">
					<div className="flex items-center justify-between">
						<CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
							<Timer className="h-3.5 w-3.5 text-primary" /> Shift
							Control
						</CardTitle>
						<div
							className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${currentShift ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20" : "bg-muted text-muted-foreground"}`}
						>
							<span
								className={`h-1.5 w-1.5 rounded-full ${currentShift ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
							/>
							{currentShift ? "Active" : "Ready"}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-4 pb-5 space-y-4">
					{currentShift ?
						<>
							{/* ELAPSED TIMER */}
							<div className="text-center">
								<span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 block">
									Working Time
								</span>
								<div className="text-5xl font-black tabular-nums tracking-tighter leading-tight">
									{formatDuration(elapsedSeconds)}
								</div>
							</div>

							{/* STARTED + REMAINING GRID */}
							<div className="grid grid-cols-1 gap-2">
								<div className="px-4 py-3 bg-muted/40 rounded-[1.25rem] border border-border/50">
									<span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-0.5">
										Started at
									</span>
									<div className="flex items-center gap-2 font-bold text-xs">
										<Clock className="h-3 w-3 text-primary/70" />
										{format(
											new Date(currentShift.startTs),
											"PPP HH:mm",
										)}
									</div>
								</div>

								{/* BIG REMAINING TIMER */}
								<div
									className={`px-4 py-4 rounded-[1.25rem] border flex flex-col items-center justify-center ${isUrgent ? "bg-destructive/10 border-destructive/20" : "bg-muted/40 border-border/50"}`}
								>
									<span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-1">
										Remaining Time
									</span>
									<div
										className={`flex items-center gap-3 font-black text-2xl tabular-nums ${
											isUrgent ?
												"text-destructive animate-pulse"
											: isWarning ? "text-orange-500"
											: "text-emerald-500"
										}`}
									>
										<AlertCircle className="h-5 w-5" />
										{formatRemaining(remainingSeconds)}
									</div>
								</div>
							</div>

							{/* ACTION BUTTONS */}
							<div className="flex gap-2.5 pt-1">
								<Button
									onClick={() =>
										setPinConfig({
											isOpen: true,
											action: onEndShift,
											title: "End Session",
										})
									}
									size="lg"
									className="flex-[2] h-14 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase transition-all active:scale-95 shadow-md"
								>
									<Square className="h-3.5 w-3.5 fill-current mr-2" />{" "}
									End Shift
								</Button>
								<Button
									onClick={() =>
										setPinConfig({
											isOpen: true,
											action: onCancelShift,
											title: "Confirm Cancel",
										})
									}
									variant="outline"
									className="flex-1 h-14 rounded-xl font-bold uppercase text-[10px] border-2 active:scale-95"
								>
									Cancel
								</Button>
							</div>
						</>
					:	<div className="space-y-3 text-center py-2">
							<Button
								onClick={() =>
									setPinConfig({
										isOpen: true,
										action: onStartShift,
										title: "Initialize Shift",
									})
								}
								size="lg"
								className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
							>
								<Play className="h-4 w-4 fill-current mr-2" />{" "}
								Start Shift
							</Button>

							<Button
								onClick={() =>
									setPinConfig({
										isOpen: true,
										action: () => setShowCustomPicker(true),
										title: "Unlock Custom",
									})
								}
								variant="ghost"
								className="w-full h-10 rounded-lg font-bold text-muted-foreground hover:text-foreground gap-2"
							>
								<History className="h-4 w-4" /> Custom Start
							</Button>

							{showCustomPicker && (
								<div className="space-y-3 mt-2 p-3 rounded-2xl bg-muted/20 border border-border/50 animate-in fade-in slide-in-from-top-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full h-12 rounded-xl justify-start font-bold border-2 bg-background/50"
											>
												<CalendarIcon className="mr-3 h-4 w-4 text-primary" />
												{selectedDate ?
													format(selectedDate, "PPP")
												:	"Pick Date"}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0 rounded-2xl border-none shadow-2xl"
											align="center"
										>
											<Calendar
												mode="single"
												selected={selectedDate}
												onSelect={setSelectedDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>

									<div className="relative">
										<Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
										<Input
											type="time"
											value={selectedTime}
											onChange={(e) =>
												setSelectedTime(e.target.value)
											}
											className="w-full h-12 rounded-xl border-2 pl-10 text-base font-bold bg-background/50"
										/>
									</div>

									<div className="flex gap-2">
										<Button
											onClick={handleConfirmCustom}
											className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest active:scale-95"
										>
											Confirm
										</Button>
										<Button
											onClick={() =>
												setShowCustomPicker(false)
											}
											variant="ghost"
											className="flex-1 h-12 rounded-xl font-bold text-muted-foreground"
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</div>
					}
				</CardContent>
			</Card>

			<PinModal
				isOpen={pinConfig.isOpen}
				onClose={() => setPinConfig({ ...pinConfig, isOpen: false })}
				onSuccess={() => pinConfig.action?.()}
				title={pinConfig.title}
			/>
		</>
	);
}
