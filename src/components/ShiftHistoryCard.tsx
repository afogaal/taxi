const onExportCSV = () => {
    if (history.length === 0) return;

    // 1. Define Headers
    const headers = ["Date", "Start", "End", "Duration", "Trips", "Earnings (kr)", "Busy Time"];
    
    // 2. Format Rows
    const rows = history.map(h => [
        formatDate(h.startTs),
        formatTimeOnly(h.startTs),
        formatTimeOnly(h.endTs),
        secondsToHM(h.seconds),
        h.trips,
        h.earnings.toFixed(2),
        h.busySeconds ? secondsToHM(h.busySeconds) : "0h 0m"
    ]);

    // 3. Create CSV Content string
    // We wrap values in double quotes to prevent Excel from splitting columns incorrectly
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");

    // 4. THE TRICK: Add UTF-8 BOM (\uFEFF)
    // This tells Excel to use UTF-8 encoding immediately
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    
    // 5. Trigger Download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `shift_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};