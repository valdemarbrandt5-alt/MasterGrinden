let intervalStarted = false;

export function startAutoRefresh() {
  if (intervalStarted) return;

  intervalStarted = true;

  console.log("Auto refresh started. Updating every hour.");

  setInterval(async () => {
    try {
      console.log("Running hourly auto refresh...");

      await fetch("http://localhost:3000/api/refresh", {
        method: "POST",
      });

      console.log("Hourly auto refresh done.");
    } catch (error) {
      console.log("Hourly auto refresh failed:", error);
    }
  }, 60 * 60 * 1000);
}