import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock, Play, Square, Timer, History, AlertCircle, Lock, Delete, Calendar as CalendarIcon, ChevronLeft, ShieldCheck } from "lucide-react";

const MY_PIN = "0000";

// ========================
// HELPERS
// ========================

const formatDuration = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatRemaining = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ========================
// PIN MODAL
// ========================

function PinModal({ isOpen, onClose, onSuccess, title }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; title: string }) {
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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[340px] rounded-[2rem] p-6 border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 p-3 bg-primary/5 rounded-2xl w-fit border border-primary/10">
            <ShieldCheck className={`h-6 w-6 ${error ? "text-destructive animate-shake" : "text-primary"}`} />
          </div>
          <DialogTitle className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-3 my-10">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`h-4 w-4 rounded-full transition-all duration-300 border-2 
                ${pin.length > i ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110" : "border-muted-foreground/20"} 
                ${error ? "bg-destructive border-destructive animate-pulse" : ""}`} 
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button key={num} variant="secondary" className="h-14 text-xl font-semibold rounded-2xl active:scale-95 transition-transform" onClick={() => handleNumberClick(num.toString())}>{num}</Button>
          ))}
          <div />
          <Button variant="secondary" className="h-14 text-xl font-semibold rounded-2xl active:scale-95 transition-transform" onClick={() => handleNumberClick("0")}>0</Button>
          <Button variant="ghost" className="h-14 rounded-2xl text-muted-foreground hover:text-destructive" onClick={() => setPin(pin.slice(0, -1))}><Delete className="h-5 w-5" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function CurrentShiftCard({ currentShift, elapsedSeconds, remainingSeconds = 0, onStartShift, onStartShiftCustom, onEndShift, onCancelShift }: any) {
  const [pinConfig, setPinConfig] = useState<any>({ isOpen: false, action: null, title: "" });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState(format(new Date(), "HH:mm"));

  const handleConfirmCustom = () => {
    if (!selectedDate) return;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes, 0, 0);
    onStartShiftCustom(finalDate.getTime());
    setShowCustomPicker(false);
  }

  const isUrgent = remainingSeconds < 1800;
  const isWarning = remainingSeconds < 3600;

  return (
    <>
      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden bg-gradient-to-b from-card to-card/80 backdrop-blur-xl max-w-md mx-auto">
        <CardHeader className="pb-4 border-b border-border/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Timer className="h-24 w-24" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary flex items-center gap-2">
              <Timer className="h-4 w-4" /> Shift Intelligence
            </CardTitle>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-colors ${currentShift ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-muted/50 border-border text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${currentShift ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground"}`} />
              {currentShift ? "Live Session" : "Standby"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-10 pb-8 px-6 space-y-8">
          {currentShift ? (
            <>
              {/* ELAPSED TIMER DISPLAY */}
              <div className="text-center relative py-4">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50 block mb-1">Time Elapsed</span>
                <div className="text-6xl font-black tabular-nums tracking-tight leading-none text-foreground drop-shadow-sm">
                  {formatDuration(elapsedSeconds)}
                </div>
              </div>

              {/* DASHBOARD GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted/20 rounded-[1.25rem] border border-border/50 group hover:border-primary/20 transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-2">Session Start</span>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <div className="p-1.5 bg-primary/10 rounded-lg"><Clock className="h-3 w-3 text-primary" /></div>
                    {format(new Date(currentShift.startTs), "HH:mm")}
                  </div>
                </div>

                <div className={`p-4 rounded-[1.25rem] border transition-all duration-500 ${isUrgent ? "bg-destructive/5 border-destructive/20" : "bg-muted/20 border-border/50"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-2">Quota Left</span>
                  <div className={`flex items-center gap-2 font-bold text-sm ${isUrgent ? "text-destructive animate-pulse" : isWarning ? "text-orange-500" : "text-emerald-500"}`}>
                    <div className={`p-1.5 rounded-lg ${isUrgent ? "bg-destructive/10" : "bg-emerald-500/10"}`}>
                       <AlertCircle className="h-3 w-3" />
                    </div>
                    {formatRemaining(remainingSeconds)}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setPinConfig({ isOpen: true, action: onEndShift, title: "Authorize End Session" })} 
                  size="lg" 
                  className="flex-[2] h-16 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold uppercase tracking-wider shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
                >
                  <Square className="h-4 w-4 fill-current mr-2" /> Stop Shift
                </Button>
                <Button 
                  onClick={() => setPinConfig({ isOpen: true, action: onCancelShift, title: "Confirm Cancellation" })} 
                  variant="outline" 
                  className="flex-1 h-16 rounded-2xl font-bold uppercase text-[10px] border-2 transition-all hover:bg-muted active:scale-[0.98]"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-4">
              <Button 
                onClick={() => setPinConfig({ isOpen: true, action: onStartShift, title: "Initialize Shift" })} 
                size="lg" 
                className="w-full h-20 rounded-[2rem] bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 fill-current" />
                    <span className="text-lg">Start Shift</span>
                  </div>
                  <span className="text-[10px] font-normal lowercase opacity-80 mt-1 italic">Click to begin tracking</span>
                </div>
              </Button>

              <Button 
                onClick={() => setPinConfig({ isOpen: true, action: () => setShowCustomPicker(true), title: "Unlock Custom Access" })} 
                variant="ghost" 
                className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 gap-2 transition-colors"
              >
                <History className="h-4 w-4" /> Custom Entry
              </Button>

              {showCustomPicker && (
                <div className="space-y-4 mt-6 p-4 rounded-3xl bg-muted/30 border border-border/50 animate-in fade-in zoom-in-95 duration-300">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-bold border-2 bg-background">
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="center">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>

                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input 
                      type="time" 
                      value={selectedTime} 
                      onChange={(e) => setSelectedTime(e.target.value)} 
                      className="w-full h-14 rounded-2xl border-2 pl-12 text-lg font-bold bg-background focus-visible:ring-primary" 
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleConfirmCustom} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/10">Apply Time</Button>
                    <Button onClick={() => setShowCustomPicker(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </div>
                </div>
              )}
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