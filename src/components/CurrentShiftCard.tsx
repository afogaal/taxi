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

// ========================
// HELPERS
// ========================

const formatDuration = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};

const formatRemaining = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
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
      <DialogContent className="sm:max-w-[320px] rounded-[2.5rem] p-8 border-none bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="space-y-2 text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
            <Lock className={`h-5 w-5 ${error ? "text-destructive animate-bounce" : "text-primary"}`} />
          </div>
          <DialogTitle className="text-lg font-black uppercase tracking-tight">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-4 my-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${pin.length > i ? "bg-primary border-primary scale-125 shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "border-muted-foreground/20"} ${error ? "bg-destructive border-destructive" : ""}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <Button key={num} variant="ghost" className="h-14 text-2xl font-bold rounded-2xl hover:bg-primary/10 active:scale-90 transition-transform" onClick={() => handleNumberClick(num.toString())}>{num}</Button>
          ))}
          <div/>
          <Button variant="ghost" className="h-14 text-2xl font-bold rounded-2xl hover:bg-primary/10 active:scale-90 transition-transform" onClick={() => handleNumberClick("0")}>0</Button>
          <Button variant="ghost" className="h-14 rounded-2xl hover:text-destructive transition-colors" onClick={() => setPin(pin.slice(0,-1))}><Delete className="h-6 w-6"/></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function CurrentShiftCard({ currentShift, elapsedSeconds, remainingSeconds=0, onStartShift, onStartShiftCustom, onEndShift, onCancelShift }: any) {
  const [pinConfig, setPinConfig] = useState<any>({ isOpen:false, action:null, title:"" });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState(format(new Date(),"HH:mm"));

  const handleConfirmCustom = () => {
    if(!selectedDate) return;
    const [hours,minutes] = selectedTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours,minutes,0,0);
    onStartShiftCustom(finalDate.getTime());
    setShowCustomPicker(false);
  }

  const isUrgent = remainingSeconds < 1800;
  const isWarning = remainingSeconds < 3600;

  return (
    <>
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-primary"/> Shift Control
            </CardTitle>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all duration-500 ${currentShift ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${currentShift ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              {currentShift ? "Active":"Ready"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-10 space-y-8">
          {currentShift ? (
            <>
              {/* ELAPSED TIMER */}
              <div className="text-center group">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 group-hover:text-primary transition-colors">Working Time</span>
                <div className="text-6xl font-black tabular-nums tracking-tighter mt-1">{formatDuration(elapsedSeconds)}</div>
              </div>

              {/* STARTED + REMAINING GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/40 rounded-[1.5rem] border border-border/50 transition-all hover:bg-muted/60">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-1">Started</span>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Clock className="h-3.5 w-3.5 text-primary/70"/>
                    {format(new Date(currentShift.startTs),"PPP HH:mm")}
                  </div>
                </div>
                <div className={`p-4 rounded-[1.5rem] border transition-all duration-300 ${isUrgent ? "bg-destructive/10 border-destructive/20" : "bg-muted/40 border-border/50"}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-1">Remaining</span>
                  <div className={`flex items-center gap-2 font-black text-sm ${isUrgent ? "text-destructive animate-pulse" : isWarning ? "text-orange-500" : "text-emerald-500"}`}>
                    <AlertCircle className="h-3.5 w-3.5"/>
                    {formatRemaining(remainingSeconds)}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <Button onClick={()=>setPinConfig({isOpen:true,action:onEndShift,title:"End Session"})} size="lg" className="flex-[2] h-16 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase transition-transform active:scale-95 shadow-lg shadow-destructive/20">
                  <Square className="h-4 w-4 fill-current mr-2"/> End Shift
                </Button>
                <Button onClick={()=>setPinConfig({isOpen:true,action:onCancelShift,title:"Confirm Cancel"})} variant="outline" className="flex-1 h-16 rounded-2xl font-bold uppercase text-[10px] border-2 hover:bg-muted active:scale-95">Cancel</Button>
              </div>
            </>
          ):(
            <div className="space-y-4 text-center">
              <Button onClick={()=>setPinConfig({isOpen:true,action:onStartShift,title:"Initialize Shift"})} size="lg" className="w-full h-20 rounded-[1.75rem] bg-primary text-primary-foreground font-black uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <Play className="h-5 w-5 fill-current mr-2"/> Start Shift
              </Button>

              <Button onClick={()=>setPinConfig({isOpen:true,action:()=>setShowCustomPicker(true),title:"Unlock Custom"})} variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-primary/5 gap-2">
                <History className="h-4 w-4"/> Custom Start Time
              </Button>

              {showCustomPicker && (
                <div className="space-y-4 mt-4 p-4 rounded-[2rem] bg-muted/20 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-bold border-2 bg-background/50 backdrop-blur-sm">
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary"/>
                        {selectedDate ? format(selectedDate,"PPP") : "Pick Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="center">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus/>
                    </PopoverContent>
                  </Popover>

                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary"/>
                    <Input type="time" value={selectedTime} onChange={(e)=>setSelectedTime(e.target.value)} className="w-full h-14 rounded-2xl border-2 pl-12 text-lg font-bold bg-background/50 backdrop-blur-sm"/>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleConfirmCustom} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95">Confirm</Button>
                    <Button onClick={()=>setShowCustomPicker(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:bg-background/50">
                      <ChevronLeft className="h-4 w-4 mr-1"/> Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PinModal isOpen={pinConfig.isOpen} onClose={()=>setPinConfig({...pinConfig,isOpen:false})} onSuccess={()=>pinConfig.action?.()} title={pinConfig.title}/>
    </>
  );
}