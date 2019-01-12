const SEARCH_DELAY = 100; // in ms
const CHAT_BOX_SELECTOR = '#main';
const PHONE_INVALID_SELECTOR = '._3lLzD';
const MESSAGE_SENDING_SELECTOR = '[data-icon="msg-time"]';
const MESSAGE_SENT_SELECTOR = '[data-icon="msg-dblcheck-ack"]';
const DEBUG = true;

console.log('waSendInBg');

async function loopOverChats() {

}

async function sendMessage() {
  const createdSelector = await resolveFirst(
    waitForSelectorToBeAdded(CHAT_BOX_SELECTOR),
    waitForPhoneInvalid()
  );

  switch (createdSelector) {
    case CHAT_BOX_SELECTOR:
      if (DEBUG) {
        document.querySelector('._35EW6').click();
        await waitForSelectorToBeAdded(MESSAGE_SENDING_SELECTOR);
        await waitForSelectorToBeRemoved(MESSAGE_SENDING_SELECTOR);
      } else {

      }
      return 'sent';
    case PHONE_INVALID_SELECTOR:
      return 'phone_invalid';
    default:
      throw `connot understand ${createdSelector}`;
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
