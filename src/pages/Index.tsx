import { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { CurrentShiftCard } from "@/components/CurrentShiftCard";
import { AddFareCard } from "@/components/AddFareCard";
import { SummaryCard } from "@/components/SummaryCard";
import { PlatformBreakdownCard } from "@/components/PlatformBreakdownCard";
import { ShiftHistoryCard } from "@/components/ShiftHistoryCard";
import { EditFareDialog } from "@/components/EditFareDialog";
import { TrackerState, Fare, ShiftHistory } from "@/types/tracker";
import { exportToCSV } from "@/utils/exportUtils";
import { Sun, Moon, Car } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "taxi-tracker:v2";

function TaxiTrackerContent() {
	const { theme, setTheme } = useTheme();
	const [state, setState] = useState<TrackerState>(() => {
		try {
			const raw = localStorage.getItem(LS_KEY);
			if (raw) return JSON.parse(raw);
		} catch (e) {
			console.error("Failed to load state from localStorage", e);
		}
		return { currentShift: null, history: [] };
	});

	const [fareInput, setFareInput] = useState("");
	const [platform, setPlatform] = useState("Uber");
	const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
	const [editingFare, setEditingFare] = useState<Fare | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [target, setTarget] = useState(3000); // 💰 Target goal

	// Save to localStorage
	useEffect(() => {
		localStorage.setItem(LS_KEY, JSON.stringify(state));
	}, [state]);

	// Timer
	useEffect(() => {
		const timer = setInterval(() => {
			setNowSec(Math.floor(Date.now() / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const startShift = useCallback(() => {
		if (state.currentShift) return;
		setState((s) => ({
			...s,
			currentShift: {
				startTs: Date.now(),
				fares: [],
				trips: 0,
				busyStartTs: null,
				busySeconds: 0,
			},
		}));
		toast.success("Shift started!");
	}, [state.currentShift]);

	const startShiftCustom = useCallback(
		(customTimestamp: number) => {
			if (state.currentShift) return;

			setState((s) => ({
				...s,
				currentShift: {
					startTs: customTimestamp,
					fares: [],
					trips: 0,
					busyStartTs: null,
					busySeconds: 0,
				},
			}));

			toast.success("Shift started with custom time!");
		},
		[state.currentShift],
	);

	const currentBusySeconds = useCallback(() => {
		if (!state.currentShift) return 0;
		const base = state.currentShift.busySeconds ?? 0;
		const running =
			state.currentShift.busyStartTs ?
				Math.max(
					0,
					Math.round(
						(nowSec * 1000 - state.currentShift.busyStartTs) / 1000,
					),
				)
			:	0;
		return base + running;
	}, [state.currentShift, nowSec]);

	const toggleBusy = useCallback(() => {
		setState((s) => {
			if (!s.currentShift) return s;
			const cs = s.currentShift;
			// If currently vacant -> turn Busy ON (record start)
			if (!cs.busyStartTs) {
				return {
					...s,
					currentShift: { ...cs, busyStartTs: Date.now() },
				};
			}
			// If currently busy -> turn Busy OFF (add elapsed to busySeconds)
			const justElapsed = Math.max(
				0,
				Math.round((Date.now() - cs.busyStartTs) / 1000),
			);
			return {
				...s,
				currentShift: {
					...cs,
					busyStartTs: null,
					busySeconds: (cs.busySeconds ?? 0) + justElapsed,
				},
			};
		});
	}, []);

	const applyManualBusy = useCallback((hhmm: string) => {
		const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
		if (!match) {
			toast.error("Use HH:MM format (e.g. 07:30)");
			return;
		}

		const hours = Number(match[1]);
		const minutes = Number(match[2]);
		if (minutes >= 60) {
			toast.error("Minutes must be < 60");
			return;
		}

		const secondsToAdd = hours * 3600 + minutes * 60;

		setState((s) => {
			if (!s.currentShift) return s;
			const cs = s.currentShift;

			// If busy is running, stop it first
			let baseSeconds = cs.busySeconds ?? 0;
			if (cs.busyStartTs) {
				baseSeconds += Math.max(
					0,
					Math.round((Date.now() - cs.busyStartTs) / 1000),
				);
			}

			return {
				...s,
				currentShift: {
					...cs,
					busyStartTs: null,
					busySeconds: baseSeconds + secondsToAdd,
				},
			};
		});

		toast.success("Busy time added");
	}, []);

	const endShift = useCallback(() => {
		if (!state.currentShift) return;
		const endTs = Date.now();
		const startTs = state.currentShift.startTs;
		const seconds = Math.max(0, Math.round((endTs - startTs) / 1000));
		const earnings = state.currentShift.fares.reduce(
			(a, b) => a + b.amount,
			0,
		);
		const trips = state.currentShift.trips;
		let finalBusySeconds = state.currentShift.busySeconds ?? 0;
		if (state.currentShift.busyStartTs) {
			finalBusySeconds += Math.max(
				0,
				Math.round(
					(Date.now() - state.currentShift.busyStartTs) / 1000,
				),
			);
		}

		const platformSummary = state.currentShift.fares.reduce(
			(acc, f) => {
				const p = f.platform || "Unknown";
				if (!acc[p]) acc[p] = { count: 0, total: 0 };
				acc[p].count += 1;
				acc[p].total += f.amount;
				return acc;
			},
			{} as Record<string, { count: number; total: number }>,
		);

		const shiftRecord: ShiftHistory = {
			id: `shift-${Date.now()}`,
			startTs,
			endTs,
			seconds,
			earnings,
			trips,
			platformSummary,
			busySeconds: finalBusySeconds,
		};

		setState((s) => ({
			...s,
			currentShift: null,
			history: [shiftRecord, ...s.history],
		}));

		toast.success(`Shift ended! Earned ${earnings.toFixed(2)} kr`);
	}, [state.currentShift]);

	const cancelShift = useCallback(() => {
		
		setState((s) => ({ ...s, currentShift: null }));
		toast.info("Shift cancelled");
	}, []);

	const addFare = useCallback(() => {
	if (!state.currentShift) {
		alert("Start a shift first");
		return;
	}

	if (!fareInput) return;

	const fare = Number(fareInput);

	if (isNaN(fare) || fare <= 0) {
		alert("Enter a valid positive number");
		return;
	}

	const adjustedFare = fare;

	const newFare: Fare = {
		id: `fare-${Date.now()}`,
		amount: adjustedFare,
		timestamp: Date.now(),
		platform,
	};

	setState((s) => {
		if (!s.currentShift) return s;

		return {
			...s,
			currentShift: {
				...s.currentShift,
				fares: [newFare, ...s.currentShift.fares],
				trips: s.currentShift.trips + 1,
			},
		};
	});

	setFareInput("");

	toast.success(
		`${platform} fare added: ${adjustedFare.toFixed(2)} kr`,
	);
}, [state.currentShift, fareInput, platform]);

	const editFare = useCallback((fare: Fare) => {
		setEditingFare(fare);
		setEditDialogOpen(true);
	}, []);

	const saveFareEdit = useCallback((fareId: string, newAmount: number) => {
		setState((s) => {
			if (!s.currentShift) return s;
			return {
				...s,
				currentShift: {
					...s.currentShift,
					fares: s.currentShift.fares.map((f) =>
						f.id === fareId ? { ...f, amount: newAmount } : f,
					),
				},
			};
		});
		toast.success("Fare updated!");
	}, []);

	const deleteFare = useCallback((fareId: string) => {
		if (!confirm("Delete this fare?")) return;
		setState((s) => {
			if (!s.currentShift) return s;
			return {
				...s,
				currentShift: {
					...s.currentShift,
					fares: s.currentShift.fares.filter((f) => f.id !== fareId),
					trips: Math.max(0, s.currentShift.trips - 1),
				},
			};
		});
		toast.success("Fare deleted");
	}, []);

	const totalEarnings = useCallback(() => {
		if (!state.currentShift) return 0;
		return state.currentShift.fares.reduce((a, b) => a + b.amount, 0);
	}, [state.currentShift]);

	const elapsedSeconds = useCallback(() => {
		if (!state.currentShift) return 0;
		return Math.max(
			0,
			Math.round((nowSec * 1000 - state.currentShift.startTs) / 1000),
		);
	}, [state.currentShift, nowSec]);

	const remainingSeconds = useCallback(() => {
		if (!state.currentShift) return 13 * 3600;
		const elapsed = Math.max(
			0,
			Math.round((nowSec * 1000 - state.currentShift.startTs) / 1000),
		);
		return Math.max(0, 13 * 3600 - elapsed);
	}, [state.currentShift, nowSec]);

	const handleExportCSV = useCallback(() => {
		exportToCSV(state.history);
		toast.success("CSV exported successfully!");
	}, [state.history]);

	const clearHistory = useCallback(() => {
		if (!confirm("Clear all saved shifts? This cannot be undone.")) return;
		setState((s) => ({ ...s, history: [] }));
		toast.success("History cleared");
	}, []);

	const deleteShift = useCallback((id: string) => {
		if (!confirm("Delete this shift?")) return;
		setState((s) => ({
			...s,
			history: s.history.filter((h) => h.id !== id),
		}));
		toast.success("Shift deleted");
	}, []);

	// 💡 Compute target remaining

	const remainingTarget = useMemo(() => {
		return Math.max(0, target - totalEarnings());
	}, [target, state.currentShift]);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<div className="max-w-3xl mx-auto p-4 space-y-4">
				<header className="flex items-center justify-between py-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary rounded-lg">
							<Car className="h-6 w-6 text-primary-foreground" />
						</div>
						<h1 className="text-2xl font-bold">
							Taxi Earnings Tracker
						</h1>
					</div>
					<Button
						onClick={() =>
							setTheme(theme === "dark" ? "light" : "dark")
						}
						variant="outline"
						size="icon"
						className="rounded-full"
					>
						{theme === "dark" ?
							<Sun className="h-5 w-5" />
						:	<Moon className="h-5 w-5" />}
					</Button>
				</header>

				<CurrentShiftCard
					currentShift={state.currentShift}
					elapsedSeconds={elapsedSeconds()}
					remainingSeconds={remainingSeconds()}
					onStartShift={startShift}
					onStartShiftCustom={startShiftCustom}
					onEndShift={endShift}
					onCancelShift={cancelShift}
				/>

				<AddFareCard
					fareInput={fareInput}
					platform={platform}
					onFareInputChange={setFareInput}
					onPlatformChange={setPlatform}
					onAddFare={addFare}
					disabled={!state.currentShift}
					busySeconds={currentBusySeconds()}
					busyActive={Boolean(state.currentShift?.busyStartTs)}
					onToggleBusy={toggleBusy}
					onSetBusySeconds={(seconds: number) => {
						setState((s) => {
							if (!s.currentShift) return s;
							return {
								...s,
								currentShift: {
									...s.currentShift,
									busySeconds:
										(s.currentShift.busySeconds ?? 0) +
										seconds,
								},
							};
						});
					}}
				/>

				{/* Summary */}
				<SummaryCard
					currentShift={state.currentShift}
					totalEarnings={totalEarnings()}
					remainingTarget={remainingTarget}
					target={target}
					elapsedSeconds={elapsedSeconds()}
					onEditFare={editFare}
					onDeleteFare={deleteFare}
					onTargetChange={(newTarget) => setTarget(newTarget)}
				/>

				{state.currentShift && (
					<PlatformBreakdownCard fares={state.currentShift.fares} />
				)}

				<ShiftHistoryCard
					history={[...state.history].sort(
						(a, b) => b.startTs - a.startTs,
					)}
					onExportCSV={handleExportCSV}
					onClearHistory={clearHistory}
					onDeleteShift={deleteShift}
				/>

				<footer className="text-center text-xs text-muted-foreground py-6">
					Data saved locally on this device. No accounts required.
				</footer>
			</div>

			<EditFareDialog
				fare={editingFare}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				onSave={saveFareEdit}
			/>
		</div>
	);
}

const Index = () => (
	<ThemeProvider defaultTheme="light">
		<TaxiTrackerContent />
	</ThemeProvider>
);

export default Index;
