const themes = [
    { color: "#ec5f67" },
    { color: "#f99157" },
    { color: "#fac863" },
    { color: "#99c794" },
    { color: "#5fb3b3" },
    { color: "#6699cc" },
    { color: "#c594c5" },
];

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("theme-buttons");

    themes.forEach(theme => {
        const button = document.createElement("button");
        button.style.background = theme.color;
        button.textContent = theme.color;
        button.addEventListener("click", () => {
            browser.runtime.sendMessage({ command: "applyTheme", color: theme.color });
        });
        container.appendChild(button);
    });

    // Add reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset to Default";
    resetButton.style.background = "#ffffff";
    resetButton.style.color = "#000";
    resetButton.addEventListener("click", () => {
        browser.runtime.sendMessage({ command: "applyTheme", color: "default" });
    });
    container.appendChild(resetButton);
});
