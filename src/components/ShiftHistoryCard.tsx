const onExportCSV = () => {
    if (history.length === 0) return;

    // 1. Clean Headers - Professional names for Excel
    const headers = [
        "Date", 
        "Shift Start", 
        "Shift End", 
        "Shift Hours", // Replaces 'seconds'
        "Trips", 
        "Earnings (kr)", 
        "Busy Hours",  // Replaces 'busy seconds'
        "Platform Summary"
    ];
    
    // 2. Format Rows with proper time conversion
    const rows = history.map(h => {
        // Format the platform breakdown into a single string: "Uber: 500, Bolt: 300"
        const platforms = h.platformSummary 
            ? Object.entries(h.platformSummary)
                .filter(([, v]) => v.total > 0)
                .map(([name, data]) => `${name}: ${data.total.toFixed(0)}`)
                .join(" | ")
            : "";

        return [
            formatDate(h.startTs),
            formatTimeOnly(h.startTs),
            formatTimeOnly(h.endTs),
            secondsToHM(h.seconds),        // Convert shift seconds to "8h 30m"
            h.trips,
            h.earnings.toFixed(2),
            h.busySeconds ? secondsToHM(h.busySeconds) : "0h 0m", // Convert busy seconds
            platforms
        ];
    });

    // 3. Build CSV with UTF-8 BOM and Quotes
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    
    // 4. Download Trigger
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Taxi_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};