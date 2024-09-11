document.getElementById('start').addEventListener('click', () => {
    const keyword = document.getElementById('keyword').value;
  
    // Send the keyword to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'showAlert', keyword: keyword });
    });
  });
  