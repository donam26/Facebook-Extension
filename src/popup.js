document.addEventListener('DOMContentLoaded', () => {
  // Restore data from chrome.storage.local if it exists
  chrome.storage.local.get(['keyword', 'comment', 'timeDelay'], (result) => {
  // chrome.storage.local.get(['keyword', 'comment', 'numberComment', 'timeDelay'], (result) => {
    if (result.keyword) {
      document.getElementById('keyword').value = result.keyword;
    }
    if (result.comment) {
      document.getElementById('comment').value = result.comment;
    }
    // if (result.numberComment) {
    //   document.getElementById('numberComment').value = result.numberComment;
    // }
    if (result.timeDelay) {
      document.getElementById('timeDelay').value = result.timeDelay;
    }
  });

  // Add event listeners for buttons
  document.getElementById('start').addEventListener('click', () => {
    const keyword = document.getElementById('keyword').value;
    const comment = document.getElementById('comment').value;
    // const numberComment = document.getElementById('numberComment').value;
    const timeDelay = document.getElementById('timeDelay').value;

    // Save the values to chrome.storage.local
    chrome.storage.local.set({ keyword: keyword, comment: comment, timeDelay:timeDelay }, () => {
      // chrome.storage.local.set({ keyword: keyword, comment: comment, numberComment:numberComment, timeDelay:timeDelay }, () => {
      console.log('Keyword and comment saved.');
    });

    // Send message to the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showAlert',
        keyword: keyword,
        comment: comment,
        // numberComment: numberComment,
        timeDelay: timeDelay
      });
    });
  });

  document.getElementById('stop').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stop' });
    });
    window.close(); 
  });

  document.getElementById('pause').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'pause' });
    });
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clearPopup') {
    // Reset all input fields in the popup
    document.getElementById('keywordInput').value = '';
    document.getElementById('commentInput').value = '';
    document.getElementById('timeDelayInput').value = '';
    console.log('Popup inputs cleared.');
  }
});

