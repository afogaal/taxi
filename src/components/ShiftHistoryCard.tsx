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
    return (
        <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
                        <History className="h-5 w-5 text-primary" />
                        Shift History
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            onClick={onExportCSV}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold shadow-sm"
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Export
                        </Button>
                        <Button
                            onClick={onClearHistory}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive"
                        >
                            Clear All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                        <History className="h-8 w-8 text-muted/40 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">No saved shifts yet.</p>
                        <p className="text-xs text-muted-foreground/60">End a shift to see your logs here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((h) => (
                            <div
                                key={h.id}
                                className="relative overflow-hidden p-4 bg-background border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Date and Time Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-black text-foreground">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                {formatDate(h.startTs)}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatTimeOnly(h.startTs)} <ArrowRight className="h-2 w-2 mx-0.5" /> {formatTimeOnly(h.endTs)}
                                            </div>
                                        </div>

                                        {/* Main Stats Row */}
                                        <div className="flex items-center justify-between py-2 border-y border-dashed border-border/60">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Duration</span>
                                                    <span className="text-sm font-semibold">{secondsToHM(h.seconds)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Trips</span>
                                                    <span className="text-sm font-semibold">{h.trips}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Earned</span>
                                                <span className="text-lg font-black text-primary leading-none">
                                                    {h.earnings.toFixed(0)} <span className="text-xs font-bold">kr</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer: Busy Time & Platforms */}
                                        <div className="space-y-2">
                                            {typeof h.busySeconds === "number" && (
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 bg-amber-50/50 w-fit px-2 py-0.5 rounded">
                                                    <span className="font-bold uppercase tracking-tighter">Busy Time:</span>
                                                    {Math.floor(h.busySeconds / 3600)}h {Math.floor((h.busySeconds % 3600) / 60)}m
                                                </div>
                                            )}

                                            {h.platformSummary && (
                                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                    {Object.entries(h.platformSummary)
                                                        .filter(([, v]) => v.count > 0)
                                                        .map(([name, data]) => (
                                                            <div key={name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                                <span className="font-bold text-foreground/80">{name}:</span>
                                                                <span className="tabular-nums font-medium">{data.total.toFixed(0)} kr</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex flex-col items-center">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDeleteShift(h.id)}
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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