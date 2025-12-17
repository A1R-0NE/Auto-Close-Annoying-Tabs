
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
  if (changeInfo.status === 'complete' && tab.url) {
    
    chrome.storage.sync.get({ blockedList: [], extensionEnabled: true }, (data) => {
      
      if (data.extensionEnabled === false) return;

      const blockedList = data.blockedList;
      
     
      const shouldBlock = blockedList.some(site => tab.url.includes(site));
      
      if (shouldBlock) {
        chrome.tabs.remove(tabId);
      }
    });
  }
});
