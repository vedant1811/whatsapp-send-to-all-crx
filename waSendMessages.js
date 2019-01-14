const SEARCH_DELAY = 100; // in ms
const NOT_START_WITH_DIGIT_OR_PLUS = /^[^+\d].*$/;
const CHAT_BOX_SELECTOR = 'div._2S1VP.copyable-text.selectable-text';
const PHONE_INVALID_SELECTOR = '._3lLzD';
const MESSAGE_SENDING_SELECTOR = '[data-icon="msg-time"]';
const MESSAGE_SENT_SELECTOR = '[data-icon="msg-dblcheck-ack"]';

// Selects only user chats (not group chats)
const USER_CHAT_NAME_SPAN_SELECTOR = '._25Ooe > ._3TEwt > ._1wjpf';

const TITLES = ['aunty', 'uncle', 'sir', 'dr', 'mama', 'mami', 'bhua', 'didi', 'bhaiya']

const DEBUG = true;
if (DEBUG) {
  var sent = [];
}

console.log('waSendInBg');

async function sendMessagesToAll() {
  const chatList = document.getElementById('pane-side');
  scrollToTop(chatList);
  while (!hasScrolledToBottom(chatList)) {
    await sendToAllInView();
    await pageDown(chatList);
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
  if (shouldSend(nameSpan)) {
    await openAndSend(nameSpan);
    saveSentTo(nameSpan);
  } else {
    // also skips contacts with the exact same name; happens especially in contacts with multiple numbers

    console.log(`skipping ${nameSpan.textContent}`);
  }
}

function shouldSend(nameSpan) {
  const text = nameSpan.textContent;
  return !sent.includes(text)
      && NOT_START_WITH_DIGIT_OR_PLUS.test(text)
      ;
}

function saveSentTo(nameSpan) {
  if (DEBUG) {
    sent.push(nameSpan.textContent)
  } // TODO: else:
}

async function openAndSend(nameSpan) {
  await openChat(nameSpan);

  await send1Message(getMessage1(nameSpan.textContent));
  await send1Message("For calls and whatsapp");
}

async function send1Message(message) {
  const chatBox = document.querySelector(CHAT_BOX_SELECTOR);
  chatBox.textContent = message;

  console.log(`sending message ${message}`);
  if (!DEBUG) {
    document.querySelector('._35EW6').click();
    await waitForSelectorToBeAdded(MESSAGE_SENDING_SELECTOR);
    await waitForSelectorToBeRemoved(MESSAGE_SENDING_SELECTOR);
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
  triggerMouseEvent(nameSpan, "mousedown");
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
