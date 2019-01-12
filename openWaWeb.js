chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('browserAction');

  chrome.tabs.create({ url: 'https://web.whatsapp.com/' }, sendMessageOnWaTab)
});

function sendMessageOnWaTab(waTab) {
  console.log(`'sendMessageOnWaTab'`);
  console.log(waTab);
  chrome.tabs.executeScript(waTab.id, { file: 'waSendMessages.js' });
}
