const SEARCH_DELAY = 100; // in ms
const NOT_START_WITH_DIGIT_OR_PLUS = /^[^+\d].*$/;
const MOUSE_DOWN_EVENT = 'mousedown';

const CHAT_BOX_SELECTOR = 'div._2S1VP.copyable-text.selectable-text';
const PHONE_INVALID_SELECTOR = '._3lLzD';
const MESSAGE_SENDING_SELECTOR = '[data-icon="msg-time"]';
const MESSAGE_SENT_SELECTOR = '[data-icon="msg-dblcheck-ack"]';
const USER_CHAT_NAME_SPAN_SELECTOR = '._25Ooe ._1wjpf';
const OVERFLOW_MENU_SELECTOR = '#main [data-icon="menu"]';
const MENU_LIST_SELECTOR = 'ul._3s1D4';

const TITLES = ['aunty', 'uncle', 'sir', 'dr', 'mama', 'mami', 'nana', 'nani', 'bhua', 'didi', 'bhaiya'];
const NEW_NO_KEY = 'new_no';

const DEBUG = false;

console.log('waSendInBg');

async function sendMessagesToAll() {
  const chatList = document.getElementById('pane-side');
  scrollToTop(chatList);
  var i = 0;
  while (!hasScrolledToBottom(chatList)) {
    if (DEBUG && i >= 0) {
      break;
    }
    await sendToAllInView();
    await pageDown(chatList);
    i++;
  }
  await sendToAllInView();
}

async function sendToAllInView() {
  console.log('sendToAllInView ============');
  nameSpans = document.querySelectorAll(USER_CHAT_NAME_SPAN_SELECTOR)
  for (nameSpan of nameSpans) {
    await sendIfNeeded(nameSpan);
  }
  console.log('============ sendToAllInView');
}

async function sendIfNeeded(nameSpan) {
  if (await shouldSend(nameSpan)) {
    await openAndSend(nameSpan);
    saveSentTo(nameSpan.textContent);
  } else {
    // also skips contacts with the exact same name; happens especially in contacts with multiple numbers

    console.log(`[sendIfNeeded] skipping ${nameSpan.textContent}`);
  }
}

async function shouldSend(nameSpan) {
  const name = nameSpan.textContent;
  return !(await wasSentTo(name)) &&
      NOT_START_WITH_DIGIT_OR_PLUS.test(name);
        // name === '+91 88849 15715';
}

function saveSentTo(name) {
  if (DEBUG) {
    return;
  }

  chrome.storage.local.set({ [name]: NEW_NO_KEY }, function() {
    console.log('saveSentTo is set for ' + name);
  });
}

function wasSentTo(name) {
  return new Promise(resolve => {
    chrome.storage.sync.get([name], function(result) {
      console.log(`[wasSentTo] ${name}:${result[name]}`);
      resolve(!!result[name]);
    });
  });
}

async function openAndSend(nameSpan) {
  await openChat(nameSpan);

  if (!(await isContactChat())) {
    console.log(`Skipping Group chat: ${nameSpan.textContent}`);
    return;
  }

  await send1Message(getMessage1(nameSpan.textContent));
  await send1Message("For calls and whatsapp");
}

// as opposed to group chat
async function isContactChat() {
  await waitForSelectorToBeAdded(OVERFLOW_MENU_SELECTOR);
  const menu = document.querySelector(OVERFLOW_MENU_SELECTOR);
  triggerMouseEvent(menu, MOUSE_DOWN_EVENT);

  await waitForSelectorToBeAdded(MENU_LIST_SELECTOR);
  const menuList = document.querySelector(MENU_LIST_SELECTOR);
  return menuList.textContent.includes('Contact info');
}

async function send1Message(message) {
  const chatBox = document.querySelector(CHAT_BOX_SELECTOR);
  chatBox.textContent = message;
  chatBox.dispatchEvent(new Event('input', {bubbles: true}));

  console.log(`sending message ${message}`);
  if (DEBUG) {
    document.querySelector('._35EW6').click();
    await waitForSelectorToBeAdded(MESSAGE_SENDING_SELECTOR);
    await waitForSelectorToBeRemoved(MESSAGE_SENDING_SELECTOR);
  } else {
    await sleep(100);
  }
}


// Promise utils:

function resolveFirst(...promises) {
  return new Promise(resolve => {
    promises.forEach(promise => {
      promise.then(value => resolve(value))
    })
  });
}

function waitForSelectorToBeRemoved(cssSelector) {
  return waitFor(() => !document.querySelector(cssSelector));
}

function waitForSelectorToBeAdded(cssSelector) {
  return waitFor(() => document.querySelector(cssSelector) ? cssSelector : false);
}

// it may run indefinitely. TODO: make it cancellable, using Promise's `reject`
function waitFor(predicate) {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (onComplete = predicate()) {
        clearInterval(interval);
        resolve(onComplete);
      }
    }, SEARCH_DELAY);
  });
}

// WA web utils, pirated from https://github.com/akhilerm/Infiny
function triggerMouseEvent(node, eventType) {
  var event = document.createEvent('MouseEvents');
  event.initEvent(eventType, true, true);
  node.dispatchEvent(event);
}

async function openChat(nameSpan) {
  triggerMouseEvent(nameSpan, MOUSE_DOWN_EVENT);
  await waitForSelectorToBeAdded(CHAT_BOX_SELECTOR);
}

function getMessage1(name) {
  const displayName =
      TITLES.find(title => name.toLowerCase().includes(title))
      || name.split(' ')[0];

  return `Hey ${displayName}. This is my new singapore number`;
}

async function pageDown(element) {
  element.scrollBy(0, element.clientHeight);
  await sleep(100);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hasScrolledToBottom(element) {
  return element.scrollTop + element.clientHeight == element.scrollHeight;
}

function scrollToTop(element) {
  return element.scrollTop = 0;
}

(async function() {
  sendMessagesToAll();
}());
