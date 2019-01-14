const SEARCH_DELAY = 100; // in ms
const CHAT_BOX_SELECTOR = 'div._2S1VP.copyable-text.selectable-text';
const PHONE_INVALID_SELECTOR = '._3lLzD';
const MESSAGE_SENDING_SELECTOR = '[data-icon="msg-time"]';
const MESSAGE_SENT_SELECTOR = '[data-icon="msg-dblcheck-ack"]';

// Selects only user chats (not group chats)
const USER_CHAT_NAME_SPAN_SELECTOR = '._25Ooe > ._3TEwt > ._1wjpf';

const DEBUG = true;
if (DEBUG) {
  var sent = [];
}

console.log('waSendInBg');

async function sendMessagesToAll() {
  await sendToAllInView();
}

async function sendToAllInView() {
  nameSpans = document.querySelectorAll(USER_CHAT_NAME_SPAN_SELECTOR)
  for (nameSpan of nameSpans) {
    await sendIfNeeded(nameSpan);
  }
}

async function sendIfNeeded(nameSpan) {
  if (!sent.includes(nameSpan.textContent)) {
    await openAndSend(nameSpan);
    saveSentTo(nameSpan);
  } else {
    console.log(`skipping ${nameSpan.textContent}`);
  }
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

  if (DEBUG) {
    console.log(`skipping message ${message}`);
  } else {
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
  const firstName = name.split(' ')[0];

  return `Hey ${firstName}. This is my new singapore number`;
}

(async function() {
  sendMessagesToAll();
}());
