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
import { Plus, Clock, Zap, ZapOff, Timer } from "lucide-react";

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
        <Card className="border-none shadow-lg overflow-hidden">
            {/* Top Status Toggle */}
           

            <CardContent className="space-y-6 pt-6">
				 <div className={`p-1 flex transition-colors duration-500 ${busyActive ? 'bg-destructive/10' : 'bg-emerald-500/10'}`}>
                <Button
                    variant="ghost"
                    onClick={onToggleBusy}
                    disabled={disabled}
                    className={`flex-1 h-14 rounded-md gap-3 text-lg font-black transition-all ${
                        busyActive 
                        ? "bg-destructive text-destructive-foreground shadow-inner" 
                        : "bg-emerald-600 text-white shadow-md hover:bg-emerald-500"
                    }`}
                >
                    {busyActive ? <Zap className="fill-current" /> : <ZapOff />}
                    {busyActive ? "BUSY" : "VACANCY"}
                </Button>
            </div>



                {/* Timer & Manual Add Row */}
                <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border/50">
                    <div className="flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Accumulated Busy
                        </span>
                        <span className="text-lg font-black tabular-nums tracking-tight">
                            {secondsToHMS(busySeconds)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-lg border shadow-sm">
                        <Input
                            placeholder="00:00"
                            className="h-8 w-16 text-xs text-center border-none focus-visible:ring-0 p-0 font-bold"
                            value={manualBusy}
                            onChange={handleManualBusyChange}
                            disabled={disabled}
                            type="tel"
                        />
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-7 px-2 text-[10px] font-bold"
                            onClick={handleAddManualBusy}
                        >
                            + MINS
                        </Button>
                    </div>
                </div>

                {/* Fare Input Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Log New Fare</span>
                        <div className="h-px flex-1 bg-border/60" />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">kr</span>
                            <Input
                                value={fareInput}
                                onChange={(e) => onFareInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !disabled && onAddFare()}
                                placeholder="0.00"
                                type="number"
                                className="pl-9 h-12 text-lg font-bold bg-muted/20 focus:bg-background transition-colors"
                                disabled={disabled}
                            />
                        </div>

                        <Select value={platform} onValueChange={onPlatformChange} disabled={disabled}>
                            <SelectTrigger className="w-[130px] h-12 font-semibold border-2">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Uber" className="font-semibold">Uber</SelectItem>
                                <SelectItem value="Bolt" className="font-semibold">Bolt</SelectItem>
                                <SelectItem value="Hailing" className="font-semibold">Hailing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={onAddFare}
                        disabled={disabled || !fareInput}
                        className="w-full h-14 text-base font-black gap-2 shadow-lg shadow-primary/20 hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
                    >
                        <Plus className="h-5 w-5 stroke-[3]" />
                        COMPLETE FARE
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}