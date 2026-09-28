/*
Program name: Patient Registration Protocol Scripts
Author: Rogelio Rios
Date created: 09/27/2026
Date last edited: 09/27/2026
Version: 1.0
Description: Shows the web client's day, date, and time in the banner.
*/

function showClientDateTime() {
    // new Date() reads the visitor's own clock and time zone
    const now = new Date();

    const date = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const el = document.getElementById("client-datetime");
    el.textContent = date + " | " + time;
    el.dateTime = now.toISOString();
}

showClientDateTime();
// Refresh every second so the minute rolls over on time
setInterval(showClientDateTime, 1000);
