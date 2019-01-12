const WA_WEB_URL = 'https://web.whatsapp.com'

chrome.browserAction.onClicked.addListener(function(currentTab) {
  console.log('browserAction');

  if (currentTab && currentTab.url.includes(WA_WEB_URL)) {
    sendMessageOnWaTab(currentTab)
  } else {
    chrome.tabs.create({ url: WA_WEB_URL }, sendMessageOnWaTab)
  }
});

function sendMessageOnWaTab(waTab) {
  console.log(`'sendMessageOnWaTab'`);
  console.log(waTab);
  chrome.tabs.executeScript(waTab.id, { file: 'waSendMessages.js' });
}
