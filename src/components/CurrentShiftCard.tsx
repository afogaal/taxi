import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock, Play, Square, Timer, History, AlertCircle, Lock, Delete, Calendar as CalendarIcon, ChevronLeft } from "lucide-react";

const MY_PIN = "0000";

export function CurrentShiftCard({
    currentShift,
    elapsedSeconds,
    remainingSeconds = 0,
    onStartShift,
    onStartShiftCustom, // This must NOT use prompts in the parent component
    onEndShift,
    onCancelShift,
}: any) {
    const [pinConfig, setPinConfig] = useState<any>({ isOpen: false, action: null, title: "" });
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState(format(new Date(), "HH:mm"));

    // --- THIS IS THE CONFIRM LOGIC ---
    const handleConfirmCustom = () => {
        if (!selectedDate) return;
        
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const finalDate = new Date(selectedDate);
        finalDate.setHours(hours, minutes, 0, 0);
        
        // This sends the number (timestamp) to your parent function
        // Ensure the parent function doesn't have a prompt inside it!
        onStartShiftCustom(finalDate.getTime());
        
        setShowCustomPicker(false);
    };

    return (
        <>
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary" /> Shift Control
                        </CardTitle>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${currentShift ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                            {currentShift ? "Active" : "Ready"}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8">
                    {!currentShift ? (
                        <div className="space-y-4">
                            {!showCustomPicker ? (
                                <>
                                    <Button 
                                        onClick={() => setPinConfig({ isOpen: true, action: onStartShift, title: "Start Shift" })} 
                                        className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase shadow-xl"
                                    >
                                        <Play className="mr-2 h-4 w-4 fill-current" /> Start Tracking
                                    </Button>
                                    <Button 
                                        onClick={() => setPinConfig({ isOpen: true, action: () => setShowCustomPicker(true), title: "Unlock Custom" })} 
                                        variant="ghost" 
                                        className="w-full h-12 rounded-xl font-bold text-muted-foreground"
                                    >
                                        <History className="mr-2 h-4 w-4" /> Custom Start Time
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-3">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-bold border-2">
                                                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                                                        {selectedDate ? format(selectedDate, "PPP") : "Date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-3xl">
                                                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                                <Input 
                                                    type="time" 
                                                    value={selectedTime} 
                                                    onChange={(e) => setSelectedTime(e.target.value)}
                                                    className="w-full h-14 rounded-2xl border-2 pl-12 text-lg font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={handleConfirmCustom} className="flex-[2] h-14 rounded-2xl font-black uppercase shadow-lg">
                                            Confirm
                                        </Button>
                                        <Button onClick={() => setShowCustomPicker(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold">
                                            Back
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Active Shift View */
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl font-black tabular-nums tracking-tighter">
                                    {Math.floor(elapsedSeconds / 3600)}:
                                    {String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')}:
                                    {String(elapsedSeconds % 60).padStart(2, '0')}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setPinConfig({ isOpen: true, action: onEndShift, title: "End Session" })} className="flex-[2] h-16 rounded-2xl bg-destructive hover:bg-destructive/90 font-black uppercase shadow-xl">
                                    <Square className="mr-2 h-4 w-4 fill-current" /> End Shift
                                </Button>
                                <Button onClick={() => setPinConfig({ isOpen: true, action: onCancelShift, title: "Confirm Cancel" })} variant="outline" className="flex-1 h-16 rounded-2xl font-bold uppercase text-[10px]">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
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

// --- PIN MODAL (Standard 0000) ---
function PinModal({ isOpen, onClose, onSuccess, title }: any) {
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
                    setTimeout(() => { setPin(""); setError(false); }, 500);
                }
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[320px] rounded-[2.5rem] p-8 bg-background/95 backdrop-blur-md border-none">
                <DialogTitle className="text-center font-black uppercase">{title}</DialogTitle>
                <div className="flex justify-center gap-4 my-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-3 w-3 rounded-full border-2 ${pin.length > i ? "bg-primary border-primary" : "border-muted-foreground/20"}`} />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button key={num} variant="ghost" className="h-14 text-xl font-bold rounded-xl" onClick={() => handleNumberClick(num.toString())}>{num}</Button>
                    ))}
                    <div />
                    <Button variant="ghost" className="h-14 text-xl font-bold rounded-xl" onClick={() => handleNumberClick("0")}>0</Button>
                    <Button variant="ghost" className="h-14 rounded-xl" onClick={() => setPin(pin.slice(0, -1))}><Delete className="h-5 w-5" /></Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}