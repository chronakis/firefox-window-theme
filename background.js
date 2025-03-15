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
    new BasicColorTheme('#fccccf'),
    new BasicColorTheme('#f9c195'),
    new BasicColorTheme('#fcd994'),
    new BasicColorTheme('#aaefae'),
    new BasicColorTheme('#9eeded'),
    new BasicColorTheme('#89aedd', '#000'),
    new BasicColorTheme('#c6badd', '#000'),
];

browser.storage.local.set({ fwt_themes: ALL_THEMES });

const DEFAULT_THEME = { colors: {} };



function applyThemeToWindow(windowId, themeId) {
    // console.log('Applying theme', themeId);
    let theme = ALL_THEMES.find(theme => theme.frame === themeId);
    if (!theme) {
        console.log('Theme not found', themeId);
        return;
    }
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
            if (message.themeId === null) {
                resetThemeToDefault(window.id);
            } else {
                const themeId = message.themeId;
                if (themeId) {
                    applyThemeToWindow(window.id, themeId);
                }
            }
        });
    }
});
