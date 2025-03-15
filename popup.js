document.addEventListener("DOMContentLoaded", () => {
    browser.storage.local.get("fwt_themes").then(data => {
        let themes = data.fwt_themes;
        if (!Array.isArray(themes)) {
            console.log('themes is not an array, converting to array');
            themes = Object.values(themes);
        }

        const container = document.getElementById("theme-buttons");

        themes.forEach(theme => {
            //console.log('theme', theme);
            const button = document.createElement("button");
            button.style.background = theme.frame;
            button.style.color = theme.tab_background_text;
            button.textContent = theme.frame;
            button.addEventListener("click", () => {
                browser.runtime.sendMessage({ command: "applyTheme", themeId: theme.frame });
            });
            container.appendChild(button);
        });

        // Add reset button
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset to Default";
        resetButton.style.background = "#ffffff";
        resetButton.style.color = "#000";
        resetButton.addEventListener("click", () => {
            browser.runtime.sendMessage({ command: "applyTheme", themeId: null });
        });
        container.appendChild(resetButton);
    });
});    
