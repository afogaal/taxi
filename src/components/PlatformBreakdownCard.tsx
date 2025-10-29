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
			<CardHeader>
				<CardTitle>Platform Breakdown</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				{entries.map(([name, data]) => (
					<div
						key={name}
						className="flex  text-sm text-muted-foreground"
					>
						<span className="font-medium">{name} </span>
						<span>
							{data.count} ride{data.count > 1 ? "s" : ""} •{" "}
							{data.total.toFixed(2)} kr
						</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
