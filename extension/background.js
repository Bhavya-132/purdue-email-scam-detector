chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'openDemoPopup') {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 380,
      height: 460,
      focused: true
    });
  }
});