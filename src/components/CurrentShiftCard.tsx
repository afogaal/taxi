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
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
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
			<DialogContent className="sm:max-w-[320px] rounded-[2.5rem] p-8 border-none bg-background/95 backdrop-blur-md">
				<DialogHeader className="space-y-2">
					<div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
						<Lock
							className={`h-5 w-5 ${error ? "text-destructive animate-bounce" : "text-primary"}`}
						/>
					</div>
					<DialogTitle className="text-center text-lg font-black uppercase tracking-tight">
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className="flex justify-center gap-4 my-8">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className={`h-3.5 w-3.5 rounded-full border-2 ${pin.length > i ? "bg-primary border-primary scale-125" : "border-muted-foreground/20"} ${error ? "bg-destructive border-destructive" : ""}`}
						/>
					))}
				</div>

				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<Button
							key={num}
							variant="ghost"
							className="h-14 text-2xl font-bold rounded-2xl"
							onClick={() => handleNumberClick(num.toString())}
						>
							{num}
						</Button>
					))}
					<div />
					<Button
						variant="ghost"
						className="h-14 text-2xl font-bold rounded-2xl"
						onClick={() => handleNumberClick("0")}
					>
						0
					</Button>
					<Button
						variant="ghost"
						className="h-14 rounded-2xl"
						onClick={() => setPin(pin.slice(0, -1))}
					>
						<Delete className="h-6 w-6" />
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
			<Card className="border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md">
				<CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
					<div className="flex items-center justify-between">
						<CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
							<Timer className="h-3.5 w-3.5 text-primary" /> Shift
							Control
						</CardTitle>

						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${currentShift ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
						>
							<span
								className={`h-1.5 w-1.5 rounded-full ${currentShift ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
							/>
							{currentShift ? "Active" : "Ready"}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-8">
					{currentShift ?
						<div className="space-y-8">
							{/* ELAPSED TIMER */}
							<div className="text-center">
								<span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
									Working Time
								</span>
								<div className="text-6xl font-black tabular-nums tracking-tighter">
									{formatDuration(elapsedSeconds)}
								</div>
							</div>

							{/* STARTED + REMAINING */}
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 bg-muted/30 rounded-[1.5rem] border border-border/40">
									<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
										Started
									</span>
									<div className="flex items-center gap-2 font-bold text-sm">
										<Clock className="h-3.5 w-3.5 text-primary/70" />
										{format(
											new Date(currentShift.startTs),
											"PPP HH:mm",
										)}
									</div>
								</div>

								<div className="p-4 bg-muted/30 rounded-[1.5rem] border border-border/40">
									<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
										Remaining
									</span>
									<div
										className={`flex items-center gap-2 font-black text-sm ${
											isUrgent ?
												"text-destructive animate-pulse"
											: isWarning ? "text-orange-500"
											: "text-emerald-500"
										}`}
									>
										<AlertCircle className="h-3.5 w-3.5" />
										{formatRemaining(remainingSeconds)}
									</div>
								</div>
							</div>

							{/* ACTION BUTTONS */}
							<div className="flex gap-3">
								<Button
									onClick={() =>
										setPinConfig({
											isOpen: true,
											action: onEndShift,
											title: "End Session",
										})
									}
									size="lg"
									className="flex-[2] h-16 rounded-2xl bg-destructive text-white font-black uppercase"
								>
									<Square className="h-4 w-4 fill-current mr-2" />{" "}
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
									className="flex-1 h-16 rounded-2xl font-bold uppercase text-[10px]"
								>
									Cancel
								</Button>
							</div>
						</div>
					:	<div className="space-y-4 py-4 text-center">
							{/* START TRACKING */}
							<Button
								onClick={() =>
									setPinConfig({
										isOpen: true,
										action: onStartShift,
										title: "Initialize Shift",
									})
								}
								size="lg"
								className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase shadow-xl"
							>
								<Play className="h-4 w-4 fill-current mr-2" />{" "}
								Start Shift
							</Button>

							{/* CUSTOM START */}
							<Button
								onClick={() =>
									setPinConfig({
										isOpen: true,
										action: () => setShowCustomPicker(true),
										title: "Unlock Custom",
									})
								}
								variant="ghost"
								className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground gap-2"
							>
								<History className="h-4 w-4" /> Custom Start
								Time
							</Button>

							{/* CUSTOM PICKER */}
							{showCustomPicker && (
								<div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full h-14 rounded-2xl justify-start font-bold border-2"
											>
												<CalendarIcon className="mr-3 h-5 w-5 text-primary" />
												{selectedDate ?
													format(selectedDate, "PPP")
												:	"Pick Date"}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0 rounded-3xl border-none shadow-2xl"
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
										<Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
										<Input
											type="time"
											value={selectedTime}
											onChange={(e) =>
												setSelectedTime(e.target.value)
											}
											className="w-full h-14 rounded-2xl border-2 pl-12 text-lg font-bold"
										/>
									</div>

									<div className="flex gap-3">
										<Button
											onClick={handleConfirmCustom}
											className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg"
										>
											Confirm
										</Button>
										<Button
											onClick={() =>
												setShowCustomPicker(false)
											}
											variant="ghost"
											className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground"
										>
											<ChevronLeft className="h-4 w-4 mr-1" />{" "}
											Back
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
