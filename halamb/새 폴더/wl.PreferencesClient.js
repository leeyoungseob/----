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
window.wl.Preferences = (function () {
  'use strict';

  const UNDEFINED_FILTER_NS = 'NO_FILTER';
  let changeListeners = {};

  // Receive message from settingsPrivate.onPrefsChanged (see wl.PreferencesServer)
  wl.RuntimeMessage.listen('.prefs', (request) => {
    if (request.type !== 'changed') {
      return;
    }

    let changes = {};

    // Group changes by namespace
    Object.keys(request.changes).forEach(changeKey => {
      let namespace = changeKey.substr(0, changeKey.indexOf('.'));

      if (namespace && changeListeners[namespace]) {
        changes[namespace] = changes[namespace] || {};
        changes[namespace][changeKey] = request.changes[changeKey];
      }

      if (changeListeners[UNDEFINED_FILTER_NS]) {
        changes[UNDEFINED_FILTER_NS] = changes[UNDEFINED_FILTER_NS] || {};
        changes[UNDEFINED_FILTER_NS][changeKey] = request.changes[changeKey];
      }
    });

    // Run handlers by namespace
    Object.keys(changes).forEach(namespace => {
      if (Array.isArray(changeListeners[namespace])) {
        changeListeners[namespace].forEach(listener => {
          listener(changes[namespace]);
        });
      }
    });
  });

  /**
   * Get specified preferences
   *
   * @param {Array} prefs ['prefNs.prefKey', ...]
   * @returns {Promise}
   */
  function getPrefs(prefs) {
    return wl.RuntimeMessage.send('.prefs', {
      type: 'get',
      prefs: prefs
    });
  }

  /**
   * Set specified preferences
   *
   * @param {Object} prefs {'prefNs.prefKey': prefValue, ...}
   * @returns {Promise}
   */
  function setPrefs(prefs) {
    return wl.RuntimeMessage.send('.prefs', {
      type: 'set',
      prefs: prefs
    });
  }

  function addChangeListener(listener, filter) {
    let namespace = filter || UNDEFINED_FILTER_NS;

    changeListeners[namespace] = changeListeners[namespace] || [];
    changeListeners[namespace].push(listener);
  }

  function removeChangeListener(listener, filter) {
    let namespace = filter || UNDEFINED_FILTER_NS;

    changeListeners[namespace] = changeListeners[namespace] || [];
    changeListeners[namespace].splice(changeListeners[namespace].indexOf(listener), 1);

    if (changeListeners[namespace].length === 0) {
      delete changeListeners[namespace];
    }
  }

  return {
    get: getPrefs,
    set: setPrefs,
    onChanged: {
      addListener: addChangeListener,
      removeListener: removeChangeListener
    }
  };
})();
