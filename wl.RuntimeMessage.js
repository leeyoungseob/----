/**
 * Copyright 2016 NAVER Corp. All Rights reserved.
 * All rights, including but not limited to, copyrights,
 * and intellectual property rights of this source code are owned by NAVER Corp.
 *
 * You may not use, reproduce, modify, or distribute this source code
 * without prior written permission from NAVER Corp.
 *
 * @author Kim Jihan <kim.jihan@navercorp.com>
 */
window.wl = window.wl || {};
window.wl.RuntimeMessage = (function () {
  'use strict';

  let listeners = {};

  whale.runtime.onMessage.addListener(onMessageReceived);

  function onMessageReceived(message, sender, sendResponse) {
    if (message.namespace && Array.isArray(listeners[message.namespace])) {
      listeners[message.namespace].forEach(listener => {
        listener(message.message, sender, sendResponse);
      });
    }

    return true;
  }

  function addListener(namespace, listener) {
    listeners[namespace] = listeners[namespace] || [];
    listeners[namespace].push(listener);
  }

  function sendMessage(namespace, message, tabId, frameId) {
    return new Promise(resolve => {
      if (typeof tabId !== 'undefined' && tabId > -1) {
        whale.tabs.sendMessage(tabId, {
          namespace: namespace,
          message: message
        },
        (typeof frameId !== 'undefined' && frameId > -1) ? {frameId: frameId} : {},
        response => {
          resolve(response);
        });
      } else {
        whale.runtime.sendMessage({
          namespace: namespace,
          message: message
        }, response => {
          resolve(response);
        });
      }
    });
  }

  function broadcast(namespace, message) {
    // broadcasting available only in background
    if (!whale.tabs) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }

    let promised = [];

    whale.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        promised.push(new Promise(resolve => {
          whale.tabs.sendMessage(tab.id, {
            namespace: namespace,
            message: message
          }, response => {
            resolve(response);
          });
        }));
      });
    });

    return Promise.all(promised);
  }

  return {
    broadcast: broadcast,
    listen: addListener,
    send: sendMessage
  };
})();
