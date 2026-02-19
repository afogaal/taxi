import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftHistory } from "@/types/tracker";
import { formatDate, formatTimeOnly, secondsToHM } from "@/utils/timeUtils";
import { Download, Trash2, History, Calendar, Clock, ArrowRight } from "lucide-react";

interface ShiftHistoryCardProps {
    history: ShiftHistory[];
    onExportCSV: () => void;
    onClearHistory: () => void;
    onDeleteShift: (id: string) => void;
}

export function ShiftHistoryCard({
    history,
    onExportCSV,
    onClearHistory,
    onDeleteShift,
}: ShiftHistoryCardProps) {
    // Check if there is any data to act upon
    const hasHistory = history.length > 0;

    return (
        <Card className="border-none shadow-xl overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
            <CardHeader className="py-3 border-b border-border/40 bg-muted/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        Log History
                    </CardTitle>
                    <div className="flex gap-1.5">
                        <Button
                            onClick={onExportCSV}
                            variant="outline"
                            size="sm"
                            disabled={!hasHistory}
                            className="h-7 px-2.5 text-[10px] font-black uppercase bg-background/50 border-2 disabled:opacity-30 disabled:grayscale transition-all"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                        </Button>
                        <Button
                            onClick={onClearHistory}
                            variant="ghost"
                            size="sm"
                            disabled={!hasHistory}
                            className="h-7 px-2.5 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-all"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3">
                {!hasHistory ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted/30 rounded-2xl bg-muted/5">
                        <div className="p-3 bg-muted/20 rounded-full mb-3">
                            <History className="h-6 w-6 text-muted/40" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                            Archive is currently empty
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {history.map((h) => (
                            <div
                                key={h.id}
                                className="group relative p-3 bg-muted/20 border border-border/40 rounded-2xl hover:bg-muted/40 transition-all duration-300"
                            >
                                <div className="flex flex-col gap-2.5">
                                    {/* TOP ROW */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-black">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                {formatDate(h.startTs)}
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-background/80 rounded-lg text-[9px] font-bold text-muted-foreground ring-1 ring-border/50">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatTimeOnly(h.startTs)} <ArrowRight className="h-2 w-2 mx-0.5" /> {formatTimeOnly(h.endTs)}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDeleteShift(h.id)}
                                            className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    {/* STATS GRID */}
                                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-dashed border-border/60">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/50">Duration</span>
                                            <span className="text-xs font-black tabular-nums">{secondsToHM(h.seconds)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/50">Trips</span>
                                            <span className="text-xs font-black tabular-nums">{h.trips}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/50">Earnings</span>
                                            <span className="text-sm font-black text-primary tabular-nums">
                                                {h.earnings.toFixed(0)} <small className="text-[9px] font-bold opacity-70">kr</small>
                                            </span>
                                        </div>
                                    </div>

                                    {/* BOTTOM SUMMARY ROW */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                        <div className="flex items-center gap-2">
                                            {typeof h.busySeconds === "number" && h.busySeconds > 0 && (
                                                <div className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                    Busy: {Math.floor(h.busySeconds / 3600)}h {Math.floor((h.busySeconds % 3600) / 60)}m
                                                </div>
                                            )}
                                        </div>
                                        
                                        {h.platformSummary && (
                                            <div className="flex gap-2.5">
                                                {Object.entries(h.platformSummary)
                                                    .filter(([, v]) => v.count > 0)
                                                    .map(([name, data]) => (
                                                        <span key={name} className="text-[9px] font-bold text-muted-foreground/70">
                                                            <span className="text-foreground/40 font-black mr-0.5">{name.toUpperCase()}</span>
                                                            <span className="text-foreground/90">{data.total.toFixed(0)}</span>
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}