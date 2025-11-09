const siteSelect = document.getElementById('site_select');
const omdbApiKey = document.getElementById('omdb_api_key');
const saveButton = document.getElementById('saveButton');

saveButton.onclick = () => {
    chrome.storage.sync.set({
        settings: {
            site_setting: siteSelect.value,
            omdb_api_key: omdbApiKey.value,
        },
    });
};

chrome.storage.sync.get('settings', (res) => {
    const settings = res.settings;
    
    siteSelect.value = settings.site_setting || 'subdl';
    omdbApiKey.value = settings.omdb_api_key || '';
});
