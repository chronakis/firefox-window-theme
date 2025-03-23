document.addEventListener("DOMContentLoaded", () => {
    browser.storage.local.get("fwt_themes").then(data => {
        let themes = data.fwt_themes;
        if (!Array.isArray(themes)) {
            console.log('themes is not an array, converting to array');
            themes = Object.values(themes);
        }

        const container = document.getElementById("theme-buttons");


        // Add reset button
        const defaultButton = document.createElement("button");
        defaultButton.textContent = "Default theme";
        defaultButton.style.background = "#eeeeee";
        defaultButton.style.color = "#000";
        defaultButton.addEventListener("click", () => {
            browser.runtime.sendMessage({ command: "applyTheme", themeId: null });
        });
        container.appendChild(defaultButton);


        themes.forEach(theme => {
            const row = document.createElement("div");
            row.classList.add("row");

            const button = document.createElement("button");
            button.style.background = theme.frame;
            button.style.color = theme.tab_background_text;
            button.textContent = theme.frame;
            button.style.flexGrow = "1";
            button.addEventListener("click", () => {
                browser.runtime.sendMessage({ command: "applyTheme", themeId: theme.frame });
            });

            row.appendChild(button);
            container.appendChild(row);
        });
    });
});

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.command === "updateThemeColors") {
        const { backgroundColor, foregroundColor } = message;
        // Handle the updated colors (e.g., save them or update the UI)
        console.log("Updated colors:", backgroundColor, foregroundColor);
    }
});

