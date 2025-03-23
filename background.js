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
function saveThemeOfWindowID() {
    const windowThemes = {};
    themeOfWindowID.forEach((theme, windowId) => {
        windowThemes[windowId] = theme.frame;
    });
    browser.storage.local.set({ windowThemes });
}
async function loadThemeOfWindowID() {
    const { windowThemes = {} } = await browser.storage.local.get("windowThemes") || {};
    for (const [windowId, themeFrame] of Object.entries(windowThemes)) {
        let theme = ALL_THEMES.find(theme => theme.frame === themeFrame);
        if (theme) {
            themeOfWindowID.set(parseInt(windowId), theme);
        }
    }
}


const ALL_THEMES = [
    new BasicColorTheme('#fccccf'),
    new BasicColorTheme('#f9c195'),
    new BasicColorTheme('#fcd994'),
    new BasicColorTheme('#aaefae'),
    new BasicColorTheme('#9eeded'),
    new BasicColorTheme('#80c2fc'),
    new BasicColorTheme('#c6badd'),
    new BasicColorTheme('#cccccc'),
    new BasicColorTheme('#aaaaaa'),
    new BasicColorTheme('#FF5733'),
    new BasicColorTheme('#33FF57'),
    new BasicColorTheme('#3357FF'),
    new BasicColorTheme('#FF33A1'),
    new BasicColorTheme('#FF8C33'),
    new BasicColorTheme('#33FFF5'),
    new BasicColorTheme('#8C33FF'),
    new BasicColorTheme('#333333','#fff')
];

browser.storage.local.set({ fwt_themes: ALL_THEMES });

const DEFAULT_THEME = { colors: {} };


function applyThemeToWindow(windowId, themeId) {
    console.log('All tehmes', ALL_THEMES);
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
    saveThemeOfWindowID();
}

function resetThemeToDefault(windowId) {
    browser.theme.reset(windowId);
    themeOfWindowID.delete(windowId);
    saveThemeOfWindowID();
}

async function applyThemeToAllWindows() {
    for (const window of await browser.windows.getAll()) {
        if (themeOfWindowID.has(window.id)) {
            applyThemeToWindow(window.id, themeOfWindowID.get(window.id).frame);
        }
    }
}

function freeThemeOfDestroyedWindow(window_id) {
    console.log('freeThemeOfDestroyedWindow', window_id);
    const theme = themeOfWindowID.get(window_id);
    if (theme) {
        theme.usage -= 1;
        themeOfWindowID.delete(window_id);
        saveThemeOfWindowID();
    }
}


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

browser.runtime.onStartup.addListener(async () => {
    await loadThemeOfWindowID();
    applyThemeToAllWindows();
});
browser.runtime.onInstalled.addListener(async () => {
    await loadThemeOfWindowID();
    applyThemeToAllWindows();
});
browser.windows.onRemoved.addListener(freeThemeOfDestroyedWindow);
