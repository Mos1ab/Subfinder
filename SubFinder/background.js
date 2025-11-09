chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const manifestSites = chrome.runtime.getManifest().content_scripts[0].matches;
    if (changeInfo.status === 'complete') {
        if (manifestSites.some((site) => tab.url.match(site.split('*://*.').pop()))) {
            chrome.tabs.sendMessage(tabId, { type: 'tabUpdated', url: tab.url });
        }
    }
});

chrome.runtime.onInstalled.addListener((e) => e.reason === 'install' && defaultSettings());

const defaultSettings = () => {
    chrome.storage.sync.set({
        settings: {
            site_setting: 'subdl',
            omdb_api_key: '',
        },
    });
};
