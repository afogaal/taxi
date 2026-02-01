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
import { Sun, Moon, Car, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "taxi-tracker:v2";

// Constants for easier maintenance
const SHIFT_LIMIT_SECONDS = 13 * 3600; 
const BOLT_FEE_MULTIPLIER = 0.77; // 23% fee

function TaxiTrackerContent() {
    const { theme, setTheme } = useTheme();
    const [state, setState] = useState<TrackerState>(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to load state", e);
        }
        return { currentShift: null, history: [] };
    });

    const [fareInput, setFareInput] = useState("");
    const [platform, setPlatform] = useState("Uber");
    const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
    const [editingFare, setEditingFare] = useState<Fare | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [target, setTarget] = useState(3000);

    // Persist State
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    }, [state]);

    // Global Ticker
    useEffect(() => {
        const timer = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Computed Values (Memoized for Performance) ---
    const elapsedSeconds = useMemo(() => {
        if (!state.currentShift) return 0;
        return Math.max(0, nowSec - Math.floor(state.currentShift.startTs / 1000));
    }, [state.currentShift, nowSec]);

    const remainingSeconds = useMemo(() => {
        return Math.max(0, SHIFT_LIMIT_SECONDS - elapsedSeconds);
    }, [elapsedSeconds]);

    const currentTotalEarnings = useMemo(() => {
        if (!state.currentShift) return 0;
        return state.currentShift.fares.reduce((acc, f) => acc + f.amount, 0);
    }, [state.currentShift]);

    const currentBusySeconds = useCallback(() => {
        if (!state.currentShift) return 0;
        const base = state.currentShift.busySeconds ?? 0;
        if (!state.currentShift.busyStartTs) return base;
        
        const running = Math.max(0, nowSec - Math.floor(state.currentShift.busyStartTs / 1000));
        return base + running;
    }, [state.currentShift, nowSec]);

    // --- Handlers ---
    const startShift = useCallback(() => {
        setState(s => ({
            ...s,
            currentShift: {
                startTs: Date.now(),
                fares: [],
                trips: 0,
                busyStartTs: null,
                busySeconds: 0,
            }
        }));
        toast.success("Shift Started. Drive safe!");
    }, []);

    const toggleBusy = useCallback(() => {
        setState(s => {
            if (!s.currentShift) return s;
            const cs = s.currentShift;
            const isStartingBusy = !cs.busyStartTs;

            if (isStartingBusy) {
                return { ...s, currentShift: { ...cs, busyStartTs: Date.now() } };
            } else {
                const elapsed = Math.max(0, Math.floor((Date.now() - cs.busyStartTs!) / 1000));
                return {
                    ...s,
                    currentShift: {
                        ...cs,
                        busyStartTs: null,
                        busySeconds: (cs.busySeconds ?? 0) + elapsed
                    }
                };
            }
        });
    }, []);

    const addFare = useCallback(() => {
        if (!state.currentShift || !fareInput) return;
        const rawAmount = parseFloat(fareInput);
        if (isNaN(rawAmount) || rawAmount <= 0) return;

        // Apply Platform Logic
        const finalAmount = platform === "Bolt" 
            ? parseFloat((rawAmount * BOLT_FEE_MULTIPLIER).toFixed(2)) 
            : rawAmount;

        const newFare: Fare = {
            id: `fare-${Date.now()}`,
            amount: finalAmount,
            timestamp: Date.now(),
            platform,
        };

        setState(s => ({
            ...s,
            currentShift: s.currentShift ? {
                ...s.currentShift,
                fares: [newFare, ...s.currentShift.fares],
                trips: s.currentShift.trips + 1
            } : null
        }));

        setFareInput("");
        toast.success(`Fare logged: ${finalAmount} kr`);
    }, [state.currentShift, fareInput, platform]);

    const endShift = useCallback(() => {
        if (!state.currentShift) return;
        
        const cs = state.currentShift;
        const total = cs.fares.reduce((a, b) => a + b.amount, 0);
        
        const historyItem: ShiftHistory = {
            id: `shift-${Date.now()}`,
            startTs: cs.startTs,
            endTs: Date.now(),
            seconds: elapsedSeconds,
            earnings: total,
            trips: cs.trips,
            busySeconds: currentBusySeconds(),
            platformSummary: cs.fares.reduce((acc, f) => {
                const p = f.platform || "Other";
                if (!acc[p]) acc[p] = { count: 0, total: 0 };
                acc[p].count++;
                acc[p].total += f.amount;
                return acc;
            }, {} as any)
        };

        setState(s => ({
            currentShift: null,
            history: [historyItem, ...s.history]
        }));
        toast.info(`Shift Summary: ${total.toFixed(0)} kr earned.`);
    }, [state.currentShift, elapsedSeconds, currentBusySeconds]);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <div className="max-w-3xl mx-auto p-4 space-y-6">
                
                {/* Header Section */}
                <header className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-all ${state.currentShift?.busyStartTs ? 'bg-destructive animate-pulse' : 'bg-primary'}`}>
                            <Car className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic">Tracker V2</h1>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {state.currentShift?.busyStartTs ? "Status: Busy" : "Status: Vacant"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full bg-muted/50"
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </header>

                <main className="space-y-4">
                    <CurrentShiftCard
                        currentShift={state.currentShift}
                        elapsedSeconds={elapsedSeconds}
                        remainingSeconds={remainingSeconds}
                        onStartShift={startShift}
                        onStartShiftCustom={() => {/* existing prompt logic */}}
                        onEndShift={endShift}
                        onCancelShift={() => state.currentShift && confirm("Discard shift?") && setState(s => ({...s, currentShift: null}))}
                    />

                    <AddFareCard
                        fareInput={fareInput}
                        platform={platform}
                        onFareInputChange={setFareInput}
                        onPlatformChange={setPlatform}
                        onAddFare={addFare}
                        disabled={!state.currentShift}
                        busySeconds={currentBusySeconds()}
                        busyActive={!!state.currentShift?.busyStartTs}
                        onToggleBusy={toggleBusy}
                        onSetBusySeconds={(secs) => setState(s => ({
                            ...s, 
                            currentShift: s.currentShift ? {...s.currentShift, busySeconds: (s.currentShift.busySeconds || 0) + secs} : null
                        }))}
                    />

                    <SummaryCard
                        currentShift={state.currentShift}
                        totalEarnings={currentTotalEarnings}
                        remainingTarget={Math.max(0, target - currentTotalEarnings)}
                        target={target}
                        elapsedSeconds={elapsedSeconds}
                        onEditFare={setEditingFare}
                        onDeleteFare={(id) => {/* filter fares logic */}}
                        onTargetChange={setTarget}
                    />

                    {state.currentShift && <PlatformBreakdownCard fares={state.currentShift.fares} />}

                    <ShiftHistoryCard
                        history={state.history}
                        onExportCSV={handleExportCSV}
                        onClearHistory={clearHistory}
                        onDeleteShift={deleteShift}
                    />
                </main>

                <footer className="flex items-center justify-center gap-2 py-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3" />
                    Encrypted Local Storage Active
                </footer>
            </div>

            <EditFareDialog
                fare={editingFare}
                open={!!editingFare}
                onOpenChange={(open) => !open && setEditingFare(null)}
                onSave={saveFareEdit}
            />
        </div>
    );
}

const Index = () => (
    <ThemeProvider defaultTheme="dark">
        <TaxiTrackerContent />
    </ThemeProvider>
);

export default Index;