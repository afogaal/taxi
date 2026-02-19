import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Clock, Zap, ZapOff } from "lucide-react";

const secondsToHMS = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};

function parseMMSS(input: string) {
    const parts = input.split(":");
    if (parts.length !== 2) return 0;
    const [m, s] = parts.map(Number);
    if (isNaN(m) || isNaN(s)) return 0;
    return m * 60 + s;
}

interface AddFareCardProps {
    fareInput: string;
    platform: string;
    onFareInputChange: (value: string) => void;
    onPlatformChange: (value: string) => void;
    onAddFare: () => void;
    disabled: boolean;
    busySeconds: number;
    busyActive: boolean;
    onToggleBusy: () => void;
    onSetBusySeconds: (seconds: number) => void;
}

export function AddFareCard({
    fareInput,
    platform,
    onFareInputChange,
    onPlatformChange,
    onAddFare,
    disabled,
    busySeconds,
    busyActive,
    onToggleBusy,
    onSetBusySeconds,
}: AddFareCardProps) {
    const [manualBusy, setManualBusy] = useState("");

    // Logical Lock States
    const isFareDisabled = disabled || busyActive;
    const isManualBusyDisabled = disabled || busyActive;
    // Button specific: Dim if Busy is active OR if input is empty
    const isAddButtonDisabled = isManualBusyDisabled || !manualBusy;

    const handleManualBusyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 3) {
            value = value.slice(0, value.length - 2) + ":" + value.slice(value.length - 2);
        }
        setManualBusy(value);
    };

    const handleAddManualBusy = () => {
        const seconds = parseMMSS(manualBusy);
        if (seconds > 0) {
            onSetBusySeconds(seconds);
            setManualBusy("");
        }
    };

    return (
        <Card className="border-none shadow-2xl overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
            <CardContent className="p-4 space-y-4">
                
                {/* 1. STATUS TOGGLE BAR */}
                <div className={`p-1 rounded-2xl flex transition-all duration-500 ${busyActive ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                    <Button
                        variant="ghost"
                        onClick={onToggleBusy}
                        disabled={disabled}
                        className={`flex-1 h-12 rounded-xl gap-3 text-sm font-black transition-all duration-300 ${
                            busyActive 
                            ? "bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-600" 
                            : "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500"
                        }`}
                    >
                        {busyActive ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
                        {busyActive ? "BUSY MODE" : "VACANCY"}
                    </Button>
                </div>

                {/* 2. BUSY DATA ROW */}
                <div className="flex items-center justify-between gap-3 bg-muted/30 px-3 py-2.5 rounded-2xl border border-border/40">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Total Busy
                        </span>
                        <span className="text-base font-black tabular-nums">
                            {secondsToHMS(busySeconds)}
                        </span>
                    </div>
                    
                    <div className={`flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/50 shadow-inner transition-all duration-300 ${isManualBusyDisabled ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        <Input
                            placeholder="MM:SS"
                            className="h-7 w-14 text-[11px] text-center border-none focus-visible:ring-0 p-0 font-bold bg-transparent"
                            value={manualBusy}
                            onChange={handleManualBusyChange}
                            disabled={isManualBusyDisabled}
                            type="tel"
                        />
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={handleAddManualBusy}
                            disabled={isAddButtonDisabled}
                            className={`h-7 px-2.5 text-[9px] font-black rounded-lg transition-all duration-300 ${
                                isAddButtonDisabled 
                                ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" 
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                            }`}
                        >
                            + ADD
                        </Button>
                    </div>
                </div>

                {/* 3. FARE INPUT SECTION */}
                <div className={`space-y-2 transition-opacity duration-300 ${isFareDisabled ? "opacity-40" : "opacity-100"}`}>
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-bold text-sm group-focus-within:text-primary transition-colors">kr</span>
                            <Input
                                value={fareInput}
                                onChange={(e) => onFareInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !isFareDisabled && onAddFare()}
                                placeholder="0.00"
                                type="number"
                                className="pl-10 h-12 text-lg font-black bg-muted/20 border-2 border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-xl"
                                disabled={isFareDisabled}
                            />
                        </div>

                        <Select value={platform} onValueChange={onPlatformChange} disabled={isFareDisabled}>
                            <SelectTrigger className="w-[110px] h-12 font-bold border-2 rounded-xl bg-background/50 hover:bg-background transition-colors">
                                <SelectValue placeholder="App" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value="Uber" className="font-bold">Uber</SelectItem>
                                <SelectItem value="Bolt" className="font-bold">Bolt</SelectItem>
                                <SelectItem value="Hailing" className="font-bold">Hailing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={onAddFare}
                        disabled={isFareDisabled || !fareInput}
                        className="w-full h-14 text-sm font-black tracking-widest gap-2 rounded-2xl shadow-xl shadow-primary/10 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                    >
                        <Plus className="h-5 w-5 stroke-[3]" />
                        ADD FARE
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}