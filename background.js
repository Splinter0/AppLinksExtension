const ignoreProtocols = [
    "https://",
    "http://",
    "ftp://",
    "file://",
    "data:",
    "mailto:",
    "tel:",
    "javascript:",
    "blob:",
    "ws://",
    "wss://",
    "about:"
];

class AppLink {
    constructor(url, origin) {
        this.url = url;
        this.origin = origin;
        this.visitedAt = new Date().toJSON();
    }
}

async function storeAppLink(appLink) {
    browser.storage.local.set({appLink: appLink}).then(
        () => console.log("Url stored successfully"),
        (error) => console.log(`Error: ${error}`)
    );
    try {
        data = await browser.storage.local.get("history");
        if (data.history) {
            historical = JSON.parse(data.history);
            historical.unshift(appLink);
        } else {
            historical = [appLink];
        }
    } catch (e) {
        console.log(`Error: ${e}`);
        historical = [appLink];
    }
    browser.browserAction.setBadgeText({ text: `${historical.length}` });
    browser.storage.local.set({history: JSON.stringify(historical)}).then(
        () => console.log("Url stored successfully in history"),
        (error) => console.log(`Error: ${error}`)
    );
}

function shouldIgnore(url) {
    for (let i = 0; i < ignoreProtocols.length; i++) {
        if (url.startsWith(ignoreProtocols[i])) {
            return true;
        }
    }

    return false;
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && shouldIgnore(changeInfo.url)) {
        browser.storage.local.set({previous: new URL(changeInfo.url).origin});
    }
});

browser.webNavigation.onBeforeNavigate.addListener(async (details) =>  {
    if (!details.url.includes("://")) {
        return;
    }
    if (shouldIgnore(details.url)) {
        return;
    }

    try {
        prev = (await browser.storage.local.get("previous")).previous;
    } catch (e) {
        console.log(`Error: ${e}`);
        prev = "manual";
    }

    appLink = new AppLink(details.url, prev);
    storeAppLink(appLink);
    browser.browserAction.setIcon({
        path: "icons/default-icon-active.png"
    });
    browser.browserAction.setBadgeBackgroundColor({ color: '#77216F' });
});

function handleRequest(request, sender, sendResponse) {
    console.log(request, sender);
    switch (request.command) {
        case "showLink":
            browser.storage.local.get("appLink").then(
                (data) => {
                    if (data) {
                        sendResponse({data: data.appLink});
                    } else {
                        sendResponse({data: null});
                    }
                },
                (error) => {
                    sendResponse({data: null});
                    console.log(`Error: ${error}`)
                }
            );
            return true;
        case "clearData":
            try {
                browser.storage.local.set({history: "[]"});
            } catch {}
        
            try {
                browser.storage.local.set({appLink: undefined});
            } catch {}
        
            try {
                browser.storage.local.set({previous: undefined});
            } catch {}
            browser.browserAction.setIcon({
                path: "icons/default-icon.png"
            });
            browser.browserAction.setBadgeText({ text: '' });
            return true;
        default:
            return false;
    }
}

browser.runtime.onMessage.addListener(handleRequest);
