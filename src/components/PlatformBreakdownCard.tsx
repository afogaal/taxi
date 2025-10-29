import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PlatformBreakdownCardProps {
	fares: { platform?: string; amount: number }[];
}

export function PlatformBreakdownCard({ fares }: PlatformBreakdownCardProps) {
	const summary = fares.reduce((acc, f) => {
		const name = f.platform || "Unknown";
		if (!acc[name]) acc[name] = { count: 0, total: 0 };
		acc[name].count += 1;
		acc[name].total += f.amount;
		return acc;
	}, {} as Record<string, { count: number; total: number }>);

	const entries = Object.entries(summary).filter(([, v]) => v.count > 0);

	if (entries.length === 0) return null;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-semibold">
					Platform Breakdown
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="divide-y divide-border">
					{entries.map(([name, data]) => (
						<div
							key={name}
							className="flex justify-between py-1 text-sm leading-tight"
						>
							<span className="font-medium text-foreground">
								{name}
							</span>
							<span className="text-right text-muted-foreground tabular-nums">
								{data.count} ride{data.count > 1 ? "s" : ""} •{" "}
								{data.total.toFixed(2)} kr
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
