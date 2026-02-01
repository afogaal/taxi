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
    onApplyManualBusy?: (hhmm: string) => void;
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

    const hoursDecimal = elapsedSeconds > 0 ? elapsedSeconds / 3600 : 0;
    const hourly = hoursDecimal > 0 ? totalEarnings / hoursDecimal : 0;

    const handleSaveTarget = () => {
        const newValue = Number(tempTarget);
        if (isNaN(newValue) || newValue <= 0) return;
        onTargetChange?.(newValue);
        setIsEditingTarget(false);
    };

    const earningColor =
        totalEarnings < 1000 ? "text-red-500" :
        totalEarnings < 2000 ? "text-yellow-600" :
        totalEarnings < 3000 ? "text-emerald-600" :
        totalEarnings < 4000 ? "text-blue-600" : "text-purple-600";

    return (
        <Card className="overflow-hidden shadow-md border-muted/60">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Shift Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                
                {/* ***** TOP GRID: Refined with better contrast ***** */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Trips", value: currentShift?.trips || 0, sub: "completed" },
                        { label: "Earnings", value: `${totalEarnings.toFixed(0)} kr`, sub: "total", color: earningColor },
                        { label: "Hours", value: hoursDecimal.toFixed(2), sub: "decimal" },
                        { label: "Hourly", value: `${hourly.toFixed(0)} kr`, sub: "avg/hr" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center p-3 bg-secondary/40 rounded-xl border border-border/50 transition-colors hover:bg-secondary/60">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                {item.label}
                            </span>
                            <span className={`text-xl font-black ${item.color || "text-foreground"}`}>
                                {item.value}
                            </span>
                            <span className="text-[9px] text-muted-foreground/70 font-medium">
                                {item.sub}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ***** TARGET + REMAINING: Callout Style ***** */}
                {typeof remainingTarget === "number" && target && (
                    <div className="rounded-xl border bg-primary/[0.03] p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg shadow-sm border">
                                    <Target className="h-4 w-4 text-primary" />
                                </div>
                                {isEditingTarget ? (
                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="number"
                                            value={tempTarget}
                                            onChange={(e) => setTempTarget(e.target.value)}
                                            className="h-8 w-24 bg-background focus-visible:ring-primary"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" onClick={handleSaveTarget} className="h-8 w-8 text-green-600 hover:bg-green-50">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Goal</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">{target.toFixed(0)} kr</span>
                                            <Button size="icon" variant="ghost" onClick={() => setIsEditingTarget(true)} className="h-5 w-5 opacity-40 hover:opacity-100">
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Remaining</span>
                                <span className={`text-lg font-black tracking-tight ${remainingTarget <= 0 ? "text-emerald-600" : "text-primary"}`}>
                                    {remainingTarget <= 0 ? "DONE!" : `${remainingTarget.toFixed(0)} kr`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ***** FARES LIST: Modern Tag System ***** */}
                {currentShift && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Fares</span>
                            <div className="h-px flex-1 bg-border mx-4" />
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
                            {currentShift.fares.length === 0 ? (
                                <div className="w-full text-center py-6 border-2 border-dashed rounded-xl text-xs text-muted-foreground font-medium">
                                    No fares recorded this shift
                                </div>
                            ) : (
                                currentShift.fares.map((fare) => (
                                    <div
                                        key={fare.id}
                                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-background border rounded-lg shadow-sm hover:border-primary/40 transition-all hover:translate-y-[-1px]"
                                    >
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-sm font-bold">{fare.amount.toFixed(0)} kr</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {new Date(fare.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-0.5 ml-1 pl-2 border-l border-muted">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onEditFare(fare)}
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onDeleteFare(fare.id)}
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
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