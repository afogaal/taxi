import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { CurrentShift } from "@/types/tracker";
import { formatTime } from "@/utils/timeUtils";
import {
	Clock,
	Play,
	Square,
	Timer,
	History,
	AlertCircle,
	Lock,
	Delete,
} from "lucide-react";

// --- CONSTANTS ---
const MY_PIN = "20267";

// --- HELPERS ---
const formatDuration = (seconds: number) => {
	const safeSec = Math.max(0, seconds);
	const h = Math.floor(safeSec / 3600);
	const m = Math.floor((safeSec % 3600) / 60);
	const s = safeSec % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatRemaining = (seconds: number) => {
	const safeSec = Math.max(0, seconds);
	const h = Math.floor(safeSec / 3600);
	const m = Math.floor((safeSec % 3600) / 60);
	return `${h}h ${m}m`;
};

// --- PIN MODAL COMPONENT ---
interface PinModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	title: string;
}

function PinModal({ isOpen, onClose, onSuccess, title }: PinModalProps) {
	const [pin, setPin] = useState("");
	const [error, setError] = useState(false);

	const handleNumberClick = (num: string) => {
		if (pin.length < 5) {
			const newPin = pin + num;
			setPin(newPin);

			// Auto-check when 5th digit is entered
			if (newPin.length === 5) {
				if (newPin === MY_PIN) {
					onSuccess();
					handleClose();
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

	const handleClose = () => {
		setPin("");
		setError(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[320px] rounded-[2.5rem] p-8 border-none bg-background/95 backdrop-blur-md">
				<DialogHeader className="space-y-2">
					<div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
						<Lock
							className={`h-5 w-5 ${error ? "text-destructive animate-pulse" : "text-primary"}`}
						/>
					</div>
					<DialogTitle className="text-center text-lg font-black uppercase tracking-tight">
						{title}
					</DialogTitle>
				</DialogHeader>

				{/* PIN Dots Display */}
				<div className="flex justify-center gap-3 my-8">
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
								pin.length > i ?
									"bg-primary border-primary scale-125"
								:	"border-muted-foreground/20"
							} ${error ? "bg-destructive border-destructive" : ""}`}
						/>
					))}
				</div>

				{/* Keypad Grid */}
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<Button
							key={num}
							variant="ghost"
							className="h-14 text-2xl font-bold rounded-2xl hover:bg-primary hover:text-primary-foreground"
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
						className="h-14 rounded-2xl text-muted-foreground"
						onClick={() => setPin(pin.slice(0, -1))}
					>
						<Delete className="h-6 w-6" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// --- MAIN CARD COMPONENT ---
interface CurrentShiftCardProps {
	currentShift: CurrentShift | null;
	elapsedSeconds: number;
	remainingSeconds?: number;
	onStartShift: () => void;
	onStartShiftCustom: () => void;
	onEndShift: () => void;
	onCancelShift: () => void;
}

export function CurrentShiftCard({
	currentShift,
	elapsedSeconds,
	remainingSeconds = 0,
	onStartShift,
	onStartShiftCustom,
	onEndShift,
	onCancelShift,
}: CurrentShiftCardProps) {
	const [pinConfig, setPinConfig] = useState<{
		isOpen: boolean;
		action: (() => void) | null;
		title: string;
	}>({
		isOpen: false,
		action: null,
		title: "",
	});

	const isWarning = remainingSeconds < 3600;
	const isUrgent = remainingSeconds < 1800;

	const remainingClass =
		isUrgent ? "text-destructive animate-pulse"
		: isWarning ? "text-orange-500"
		: "text-emerald-500";

	const requestPin = (action: () => void, title: string) => {
		setPinConfig({ isOpen: true, action, title });
	};

	return (
		<>
			<Card className="border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md">
				<CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
					<div className="flex items-center justify-between">
						<CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
							<Timer className="h-3.5 w-3.5 text-primary" />
							Shift Control
						</CardTitle>
						<div
							className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
								currentShift ?
									"bg-emerald-500/10 text-emerald-500"
								:	"bg-muted text-muted-foreground"
							}`}
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
							<div className="text-center space-y-1">
								<span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
									Session Time
								</span>
								<div className="text-6xl font-black tabular-nums tracking-tighter text-foreground">
									{formatDuration(elapsedSeconds)}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 bg-muted/30 rounded-[1.5rem] border border-border/40">
									<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
										Started
									</span>
									<div className="flex items-center gap-2 font-bold text-sm">
										<Clock className="h-3.5 w-3.5 text-primary/70" />
										{formatTime(currentShift.startTs)}
									</div>
								</div>
								<div className="p-4 bg-muted/30 rounded-[1.5rem] border border-border/40">
									<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
										Until Target
									</span>
									<div
										className={`flex items-center gap-2 font-black text-sm ${remainingClass}`}
									>
										<AlertCircle className="h-3.5 w-3.5" />
										{formatRemaining(remainingSeconds)}
									</div>
								</div>
							</div>

							<div className="flex gap-3 pt-2">
								<Button
									onClick={() =>
										requestPin(onEndShift, "End Session")
									}
									size="lg"
									className="flex-[2] h-16 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-wider gap-2 shadow-xl shadow-destructive/20"
								>
									<Square className="h-4 w-4 fill-current" />
									End Shift
								</Button>
								<Button
									onClick={onCancelShift}
									variant="outline"
									className="flex-1 h-16 rounded-2xl font-bold uppercase text-[10px] border-2"
								>
									Cancel
								</Button>
							</div>
						</div>
					:	<div className="space-y-4 py-4">
							<Button
								onClick={() =>
									requestPin(onStartShift, "Initialize Shift")
								}
								size="lg"
								className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
							>
								<Play className="h-4 w-4 fill-current" />
								Start Tracking
							</Button>
							<Button
								onClick={() =>
									requestPin(
										onStartShiftCustom,
										"Custom Entry",
									)
								}
								variant="ghost"
								className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground gap-2"
							>
								<History className="h-4 w-4" />
								Custom Start Time
							</Button>
						</div>
					}
				</CardContent>
			</Card>

			<PinModal
				isOpen={pinConfig.isOpen}
				onClose={() =>
					setPinConfig((prev) => ({ ...prev, isOpen: false }))
				}
				onSuccess={() => pinConfig.action?.()}
				title={pinConfig.title}
			/>
		</>
	);
}
