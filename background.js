class BasicColorTheme {
    constructor(frame, tab_background_text = '#111') {
        this.frame = frame;
        this.tab_background_text = tab_background_text;
        this.usage = 0;
        this.lastUsed = Math.random();
    }

    get browserThemeObject() {
        return {
            colors: {
                frame: this.frame,
                tab_background_text: this.tab_background_text,
            }
        };
    }
}

let themeOfWindowID = new Map();
const ALL_THEMES = [
    new BasicColorTheme('#ec5f67'),
    new BasicColorTheme('#f99157'),
    new BasicColorTheme('#fac863'),
    new BasicColorTheme('#99c794'),
    new BasicColorTheme('#5fb3b3'),
    new BasicColorTheme('#6699cc'),
    new BasicColorTheme('#c594c5'),
];

const DEFAULT_THEME = { colors: {} };

function applyThemeToWindow(windowId, theme) {
    browser.theme.update(windowId, theme.browserThemeObject);
    theme.usage += 1;
    theme.lastUsed = Date.now();
    themeOfWindowID.set(windowId, theme);
}

function resetThemeToDefault(windowId) {
    browser.theme.reset(windowId);
    themeOfWindowID.delete(windowId);
}

async function applyThemeToAllWindows() {
    for (const window of await browser.windows.getAll()) {
        if (themeOfWindowID.has(window.id)) {
            applyThemeToWindow(window.id, themeOfWindowID.get(window.id));
        }
    }
}

function freeThemeOfDestroyedWindow(window_id) {
    const theme = themeOfWindowID.get(window_id);
    if (theme) {
        theme.usage -= 1;
        themeOfWindowID.delete(window_id);
    }
}

browser.windows.onRemoved.addListener(freeThemeOfDestroyedWindow);
browser.runtime.onStartup.addListener(applyThemeToAllWindows);
browser.runtime.onInstalled.addListener(applyThemeToAllWindows);

// Popup interaction
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.command === "applyTheme") {
        browser.windows.getCurrent().then(window => {
            if (message.color === "default") {
                resetThemeToDefault(window.id);
            } else {
                const selectedTheme = ALL_THEMES.find(t => t.frame === message.color);
                if (selectedTheme) {
                    applyThemeToWindow(window.id, selectedTheme);
                }
            }
        });
    }
});
