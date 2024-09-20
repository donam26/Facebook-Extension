let scrollInterval;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Lấy tab hiện tại
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    if (message.action === 'start') {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: startScrolling
      });
    } else if (message.action === 'pause') {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: pauseScrolling
      });
    } else if (message.action === 'stop') {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: stopScrolling
      });
      chrome.runtime.sendMessage({ action: 'clearPopup' });

    }
  });
});

function startScrolling() {
  window.scrollBy(0, 1000); // Cuộn 1000 pixel
  scrollInterval = setInterval(() => {
    window.scrollBy(0, 1000); // Cuộn thêm 1000 pixel mỗi lần
  }, 2000); // Cuộn sau mỗi 2 giây
}

function pauseScrolling() {
  clearInterval(scrollInterval);
}

function stopScrolling() {
  clearInterval(scrollInterval);
  window.scrollTo(0, 0); // Cuộn về đầu trang
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clearPopup') {
    // Reset all input fields in the popup
    document.getElementById('keywordInput').value = '';
    document.getElementById('commentInput').value = '';
    document.getElementById('timeDelayInput').value = '';
    console.log('Popup inputs cleared.');
  }
});
