// ... (imports remain the same)

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
        totalEarnings < 2000 ? "text-amber-500" :
        totalEarnings < 3000 ? "text-emerald-500" :
        totalEarnings < 4000 ? "text-blue-500" : "text-violet-500";

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-b from-card to-muted/20">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Live Session
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* ***** TOP GRID: Refined with borders and better spacing ***** */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Trips", value: currentShift?.trips || 0, icon: <Car className="h-3 w-3" /> },
                        { label: "Earnings", value: `${totalEarnings.toFixed(0)} kr`, color: earningColor, icon: <Coins className="h-3 w-3" /> },
                        { label: "Hours", value: hoursDecimal.toFixed(2), icon: <Clock className="h-3 w-3" /> },
                        { label: "Hourly", value: `${hourly.toFixed(0)} kr`, icon: <Target className="h-3 w-3" /> }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-background/50 border border-border/50 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                                {stat.icon}
                                {stat.label}
                            </div>
                            <div className={`text-xl font-black ${stat.color || "text-foreground"}`}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ***** TARGET + REMAINING: Modern Progress Look ***** */}
                {typeof remainingTarget === "number" && target && (
                    <div className="relative overflow-hidden rounded-xl bg-primary/5 p-4 border border-primary/10">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg shadow-sm">
                                    <Target className="h-4 w-4 text-primary" />
                                </div>
                                {isEditingTarget ? (
                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="number"
                                            value={tempTarget}
                                            onChange={(e) => setTempTarget(e.target.value)}
                                            className="h-8 w-24 bg-background"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" onClick={handleSaveTarget} className="h-8 w-8 text-green-600">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Current Goal</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">{target.toFixed(0)} kr</span>
                                            <Button size="icon" variant="ghost" onClick={() => setIsEditingTarget(true)} className="h-5 w-5 opacity-50 hover:opacity-100">
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Remaining</span>
                                <span className={`text-lg font-black ${remainingTarget <= 0 ? "text-emerald-500" : "text-primary"}`}>
                                    {remainingTarget.toFixed(0)} kr
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ***** FARES LIST: Clean Tag-based approach ***** */}
                {currentShift && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fare History</h4>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Newest First</span>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pb-2">
                            {currentShift.fares.length === 0 ? (
                                <div className="w-full py-8 border-2 border-dashed rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">
                                    No fares recorded yet...
                                </div>
                            ) : (
                                currentShift.fares.map((fare) => (
                                    <div
                                        key={fare.id}
                                        className="group inline-flex items-center gap-3 px-3 py-2 bg-background border border-border/60 rounded-xl shadow-sm hover:border-primary/30 transition-all hover:scale-[1.02]"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{fare.amount.toFixed(0)} kr</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-medium">
                                                {new Date(fare.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity border-l pl-2 ml-1">
                                            <Button size="icon" variant="ghost" onClick={() => onEditFare(fare)} className="h-7 w-7">
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => onDeleteFare(fare.id)} className="h-7 w-7 hover:text-red-500">
                                                <Trash2 className="h-3.5 w-3.5" />
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