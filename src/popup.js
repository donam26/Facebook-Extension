document.getElementById('start').addEventListener('click', () => {
  const keyword = document.getElementById('keyword').value;
  const comment = document.getElementById('comment').value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showAlert',
      keyword: keyword,
      comment: comment
    });
  });
});

document.getElementById('stop').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'stop' });
  });
});
