export interface Fare {
	id: string;
	amount: number;
	timestamp: number;
}

export interface CurrentShift {
	startTs: number;
	fares: Fare[];
	trips: number;

	busyStartTs?: number | null; // when Busy was turned on (ms)
	busySeconds?: number; // accumulated busy seconds in this shift
}

export interface ShiftHistory {
	id: string;
	startTs: number;
	endTs: number;
	seconds: number;
	earnings: number;
	trips: number;
	platformSummary?: Record<string, { count: number; total: number }>;

	busySeconds?: number; // total busy seconds saved for this shift
}

export interface TrackerState {
	currentShift: CurrentShift | null;
	history: ShiftHistory[];
}
