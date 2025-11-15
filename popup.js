
const darkModeToggle = document.getElementById("darkModeToggle");

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    darkModeToggle.checked = false;
  }
}

chrome.storage.sync.get({ darkModeEnabled: false }, (data) => {
  applyTheme(data.darkModeEnabled);
});

const newLinkInput = document.getElementById("newLink");
const addBtn = document.getElementById("addBtn");
const blockCurrentBtn = document.getElementById("blockCurrentBtn");
const list = document.getElementById("list");

loadList();

blockCurrentBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab || !currentTab.url) return;
    if (currentTab.url.startsWith("chrome://") || currentTab.url.startsWith("about:")) {
      return;
    }
    let hostname;
    try {
      hostname = new URL(currentTab.url).hostname;
    } catch (e) {
      console.error("Could not parse URL:", currentTab.url, e);
      return;
    }
    chrome.storage.sync.get({ blockedList: [] }, (data) => {
      if (!data.blockedList.includes(hostname)) {
        const newList = [...data.blockedList, hostname];
        chrome.storage.sync.set({ blockedList: newList }, () => {
          chrome.tabs.reload(currentTab.id);
          window.close();
        });
      } else {
        window.close();
      }
    });
  });
});


addBtn.addEventListener("click", () => {
  const val = newLinkInput.value.trim();
  if (!val) return;

  chrome.storage.sync.get({ blockedList: [] }, (data) => {
    if (!data.blockedList.includes(val)) { 
      const newList = [val, ...data.blockedList]; 
      
      chrome.storage.sync.set({ blockedList: newList }, () => {
        
        if (data.blockedList.length === 0) {
          list.innerHTML = "";
        } 
        addListItem(val, true); 
        
        newLinkInput.value = "";
      });
    } else {
      newLinkInput.value = "";
    }
  });
});

function loadList() {
  chrome.storage.sync.get({ blockedList: [] }, (data) => {
    list.innerHTML = ""; 
    
    if (data.blockedList.length === 0) {
      showEmptyMessage(); 
    } else { 
      data.blockedList.forEach((item) => addListItem(item));
    }
  });
}

function addListItem(text, prepend = false) {
  const li = document.createElement("li");  

  const span = document.createElement("span");
  span.textContent = text;
  span.title = text; 
  li.appendChild(span);

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "&times;"; 
  removeBtn.className = "remove-btn";
   
  removeBtn.addEventListener("click", () => {
    handleRemove(text, li);  
  });
  li.appendChild(removeBtn);
   
  if (prepend) {
    list.prepend(li);
  } else {
    list.appendChild(li);
  }
}

function handleRemove(text, element) {  
   
  element.remove();
 
  chrome.storage.sync.get({ blockedList: [] }, (data) => {
    const newList = data.blockedList.filter((item) => item !== text);
    chrome.storage.sync.set({ blockedList: newList }, () => {
       
      if (newList.length === 0) {
        loadList(); 
      }
    });
  });
}
 
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  
  if (confirm("Are you sure? This will delete all your custom sites and restore the default list.")) {
     
    fetchAndResetList();
  }
});

async function fetchAndResetList() {
  try {
     
    const response = await fetch('default_list.json');
    if (!response.ok) {
      throw new Error('Could not load default list');
    }
    const defaultBlocked = await response.json();
    
     
    chrome.storage.sync.set({ blockedList: defaultBlocked }, () => {
       
      loadList(); 
    });

  } catch (error) {
    console.error("Failed to reset list:", error);
  }
}


const creditsBtn = document.getElementById("creditsBtn");
const donateBtn = document.getElementById("donateBtn");
creditsBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com/A1R-0NE" });
});
donateBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://ko-fi.com/airone/" });
});


function showEmptyMessage() {
  const li = document.createElement("li");
  li.textContent = "Blocked Url's are listed Here.";
  li.className = "empty-item";
  list.appendChild(li);
}

darkModeToggle.addEventListener("click", () => {
  const isDark = darkModeToggle.checked;
  chrome.storage.sync.set({ darkModeEnabled: isDark }, () => {
    applyTheme(isDark);
  });
});