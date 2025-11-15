
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    try {

      const response = await fetch('default_list.json');
      if (!response.ok) {
        throw new Error('Could not load default list');
      }


      const defaultBlocked = await response.json();


      chrome.storage.sync.set({ blockedList: defaultBlocked });

    } catch (error) {
      console.error("Failed to set default blocklist:", error);
    }
  }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url && !tab.title) {
    return;
  }

  chrome.storage.sync.get({ blockedList: [] }, (data) => {
    const allBlocked = data.blockedList;

    const urlBlocked = tab.url && allBlocked.some((pattern) => tab.url.includes(pattern));
    const titleBlocked = tab.title && allBlocked.some((pattern) => tab.title.includes(pattern));

    if (urlBlocked || titleBlocked) {
      chrome.tabs.remove(tabId);
    }
  });
});