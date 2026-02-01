import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Smartphone, Car, Globe } from "lucide-react";

interface PlatformBreakdownCardProps {
    fares: { platform?: string; amount: number }[];
}

export function PlatformBreakdownCard({ fares }: PlatformBreakdownCardProps) {
    const totalSessionEarnings = fares.reduce((sum, f) => sum + f.amount, 0);
    
    const summary = fares.reduce((acc, f) => {
        const name = f.platform || "Unknown";
        if (!acc[name]) acc[name] = { count: 0, total: 0 };
        acc[name].count += 1;
        acc[name].total += f.amount;
        return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const entries = Object.entries(summary)
        .filter(([, v]) => v.count > 0)
        .sort((a, b) => b[1].total - a[1].total); // Sort by highest earning

    if (entries.length === 0) return null;

    // Helper for platform-specific icons/colors (Visual only)
    const getPlatformStyles = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("uber")) return { icon: <Smartphone className="h-3 w-3" />, color: "bg-black" };
        if (n.includes("bolt")) return { icon: <Car className="h-3 w-3" />, color: "bg-emerald-500" };
        return { icon: <Globe className="h-3 w-3" />, color: "bg-muted-foreground" };
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    Platform Breakdown
                    <span className="text-[10px] lowercase font-normal opacity-70">by earnings</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {entries.map(([name, data]) => {
                        const styles = getPlatformStyles(name);
                        const percentage = (data.total / totalSessionEarnings) * 100;

                        return (
                            <div key={name} className="group space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded-md text-white ${styles.color}`}>
                                            {styles.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold leading-none">{name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {data.count} {data.count === 1 ? 'ride' : 'rides'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black tabular-nums">
                                            {data.total.toFixed(0)} <span className="text-[10px] font-normal text-muted-foreground">kr</span>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Visual Market Share Bar */}
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full opacity-80 transition-all duration-500 ${styles.color}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Optional: Simple Total Footer */}
                <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                    <span>Total Share</span>
                    <span>100%</span>
                </div>
            </CardContent>
        </Card>
    );
}