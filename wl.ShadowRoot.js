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
window.wl.ShadowRoot = (function () {
  'use strict';

  // <whale> is non-standard element but treated like as a <div> by browser.
  let rootEl = document.createElement('whale');

  // TODO: createShadowRoot will be replaced with attachShadow
  let shadowRoot = rootEl.createShadowRoot({mode: 'closed'});

  // prevent site translation
  // translate="no" attribute means "this element should not be translated".
  rootEl.setAttribute('translate', 'no');

  // html > whale
  document.documentElement.appendChild(rootEl);

  return shadowRoot;
})();
