/* Levo tracker — حطه في كل صفحات الموقع:  <script src="./tracker.js" defer></script>
   عشان تستبعد نفسك من الإحصائيات: افتح الموقع مرة واحدة بالرابط  ?notrack=1  (ولإلغاء الاستبعاد ?notrack=0) */
(function () {
  'use strict';

  var CFG = {
    url: 'https://goulvnitnxrjaezmfmiz.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdWx2bml0bnhyamFlem1mbWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTUzMTUsImV4cCI6MjEwNzE5MTMxNX0.EpFs76RdGLqD_5dw-u3scezHUgy5W_S6rJNh2dlekx8',
    table: 'analytics_events',
    sessionGapMs: 30 * 60 * 1000
  };

  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  if (/[?&]notrack=1/.test(location.search)) ls.set('levo_ignore', '1');
  if (/[?&]notrack=0/.test(location.search)) ls.del('levo_ignore');
  if (ls.get('levo_ignore') === '1') return;
  if (/bot|crawl|spider|headless|lighthouse|pagespeed/i.test(navigator.userAgent)) return;

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  /* ---------- هوية الزائر والجلسة ---------- */
  var visitorId = ls.get('levo_vid'), isNew = false;
  if (!visitorId) { visitorId = uid(); ls.set('levo_vid', visitorId); isNew = true; }
  else if (ls.get('levo_new_sid') === ls.get('levo_sid')) { isNew = true; }

  var sessionId = ls.get('levo_sid'), lastAct = parseInt(ls.get('levo_sat') || '0', 10);
  var now0 = Date.now();
  if (!sessionId || now0 - lastAct > CFG.sessionGapMs) {
    sessionId = uid(); ls.set('levo_sid', sessionId);
    if (isNew) ls.set('levo_new_sid', sessionId);
  }
  function touch() { ls.set('levo_sat', String(Date.now())); }
  touch();

  /* ---------- معلومات الجهاز ---------- */
  var ua = navigator.userAgent;
  var width = window.innerWidth || screen.width;
  var device = width < 768 ? 'موبايل' : (width < 1100 ? 'تابلت' : 'كمبيوتر');
  var browser = 'أخرى';
  if (/Instagram/i.test(ua)) browser = 'Instagram (داخل التطبيق)';
  else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook (داخل التطبيق)';
  else if (/musical_ly|TikTok|Bytedance/i.test(ua)) browser = 'TikTok (داخل التطبيق)';
  else if (/Snapchat/i.test(ua)) browser = 'Snapchat (داخل التطبيق)';
  else if (/EdgA?\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/.test(ua)) browser = 'Samsung Internet';
  else if (/Firefox|FxiOS/.test(ua)) browser = 'Firefox';
  else if (/Chrome|CriOS/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua)) browser = 'Safari';
  var os = 'أخرى';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  var qs = new URLSearchParams(location.search);
  var ref = document.referrer || '';
  try { if (ref && new URL(ref).host === location.host) ref = ''; } catch (e) {}
  var base = {
    visitor_id: visitorId,
    session_id: sessionId,
    referrer: ref ? ref.slice(0, 480) : null,
    utm_source: qs.get('utm_source') || qs.get('src'),
    utm_medium: qs.get('utm_medium'),
    utm_campaign: qs.get('utm_campaign'),
    device: device, browser: browser, os: os,
    screen: (screen.width || 0) + 'x' + (screen.height || 0),
    lang: (navigator.language || '').slice(0, 12),
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 40),
    country: ls.get('levo_cc') || null,
    is_new: isNew
  };

  /* ---------- الإرسال ---------- */
  var queue = [], timer = null;
  function pagePath() {
    var p = location.pathname.replace(/index\.html$/, '');
    return p || '/';
  }
  function row(type, extra) {
    var r = {
      type: type, page: pagePath(), title: (document.title || '').slice(0, 120),
      label: null, section: null, href: null, value: null, meta: {}
    };
    for (var k in base) r[k] = base[k];
    for (var e in extra) r[e] = extra[e];
    return r;
  }
  function send(rows) {
    if (!rows.length) return;
    try {
      fetch(CFG.url + '/rest/v1/' + CFG.table, {
        method: 'POST', keepalive: true,
        headers: {
          apikey: CFG.key, Authorization: 'Bearer ' + CFG.key,
          'Content-Type': 'application/json', Prefer: 'return=minimal'
        },
        body: JSON.stringify(rows)
      }).catch(function () {});
    } catch (e) {}
  }
  function flush() {
    clearTimeout(timer); timer = null;
    var rows = queue; queue = [];
    send(rows);
  }
  function track(type, extra, now) {
    touch();
    queue.push(row(type, extra || {}));
    if (now) flush(); else if (!timer) timer = setTimeout(flush, 2500);
  }

  /* ---------- القسم اللي العنصر موجود فيه ---------- */
  function sectionOf(el) {
    var s = el.closest('section[id], header, footer, [role="dialog"], [class*="modal"], nav');
    if (!s) return null;
    if (s.matches('[role="dialog"], [class*="modal"]')) return 'نافذة: ' + (s.id || 'modal');
    if (s.tagName === 'HEADER') return 'header';
    if (s.tagName === 'FOOTER') return 'footer';
    if (s.tagName === 'NAV') return 'nav';
    return s.id;
  }

  /* ---------- الضغطات ---------- */
  var lastClickLabel = '';
  var CLICK_SEL = 'a, button, summary, [role="button"], [data-track], .chip, .whom-card, .pkg, .work-card, .feat';
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var el = t.closest(CLICK_SEL); if (!el) return;
    var txt = (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 70);
    var href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
    var label = txt || el.id || href || el.className.toString().split(' ')[0] || 'عنصر';
    var type = 'click';
    if (/wa\.me|whatsapp/i.test(href)) type = 'whatsapp';
    else if (/^(tel|mailto):/i.test(href)) type = 'outbound';
    else if (/^https?:/i.test(href)) { try { if (new URL(href).host !== location.host) type = 'outbound'; } catch (er) {} }
    lastClickLabel = label;
    track(type, {
      label: label, section: sectionOf(el), href: href ? href.slice(0, 480) : null,
      meta: { id: el.id || null, tag: el.tagName.toLowerCase(), cls: (el.className && el.className.toString().slice(0, 60)) || null }
    }, type !== 'click');
  }, true);

  /* فتح واتساب بالكود (بعد "ابعت الطلب") */
  var origOpen = window.open;
  window.open = function (url) {
    try {
      if (url && /wa\.me|whatsapp/i.test(String(url))) {
        track('whatsapp', { label: 'فتح واتساب من الفورم', section: 'نافذة: giftModal', href: String(url).slice(0, 80), meta: { from: lastClickLabel, order: true } }, true);
      }
    } catch (e) {}
    return origOpen.apply(window, arguments);
  };

  /* ---------- التمرير ---------- */
  var maxScroll = 0, sent = {};
  function scrollPct() {
    var h = document.documentElement, b = document.body;
    var total = Math.max(h.scrollHeight, b.scrollHeight) - window.innerHeight;
    return total <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / total) * 100));
  }
  var scrollTick = false;
  window.addEventListener('scroll', function () {
    if (scrollTick) return; scrollTick = true;
    requestAnimationFrame(function () {
      scrollTick = false;
      var p = scrollPct(); if (p > maxScroll) maxScroll = p;
      [25, 50, 75, 100].forEach(function (m) {
        if (maxScroll >= m && !sent[m]) { sent[m] = 1; track('scroll', { label: m + '%', value: m }); }
      });
    });
  }, { passive: true });

  /* ---------- الأقسام: وصل لها؟ قعد فيها قد إيه؟ ---------- */
  var secMs = {}, secSeen = {}, secVisible = {}, secSince = {};
  function setupSections() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id || en.target.getAttribute('data-sec') || en.target.className.toString().split(' ')[0];
        if (en.isIntersecting && en.intersectionRatio >= 0.35) {
          if (!secVisible[id]) { secVisible[id] = 1; secSince[id] = Date.now(); }
          if (!secSeen[id]) { secSeen[id] = 1; track('section_view', { label: id, section: id }); }
        } else if (secVisible[id]) {
          secMs[id] = (secMs[id] || 0) + (Date.now() - secSince[id]); secVisible[id] = 0;
        }
      });
    }, { threshold: [0, 0.35, 0.6] });
    document.querySelectorAll('section[id], .hero, .final, footer').forEach(function (s) { io.observe(s); });
  }

  /* ---------- وقت البقاء + الخروج ---------- */
  var activeMs = 0, activeSince = document.hidden ? 0 : Date.now();
  function leave(reason) {
    var t = Date.now();
    if (activeSince) { activeMs += t - activeSince; activeSince = 0; }
    Object.keys(secVisible).forEach(function (id) {
      if (secVisible[id]) { secMs[id] = (secMs[id] || 0) + (t - secSince[id]); secSince[id] = t; }
    });
    var secs = {}; Object.keys(secMs).forEach(function (id) { if (secMs[id] > 300) secs[id] = Math.round(secMs[id]); });
    if (activeMs > 0) {
      track('leave', { value: Math.round(activeMs / 1000), label: reason, meta: { max_scroll: maxScroll, sections: secs } }, true);
    }
    activeMs = 0; secMs = {};
  }
  function resume() {
    activeSince = Date.now();
    Object.keys(secVisible).forEach(function (id) { if (secVisible[id]) secSince[id] = Date.now(); });
    touch();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) leave('hidden'); else resume();
  });
  window.addEventListener('pagehide', function () { leave('pagehide'); });

  /* ---------- أخطاء الجافاسكربت ---------- */
  var errCount = 0;
  window.addEventListener('error', function (e) {
    if (errCount++ > 3) return;
    track('error', { label: String(e.message || 'error').slice(0, 150), meta: { src: (e.filename || '').slice(-80), line: e.lineno || 0 } });
  });

  /* ---------- البداية ---------- */
  function start() {
    track('pageview', { label: document.title.slice(0, 120), meta: { w: width, h: window.innerHeight, nav: (performance.getEntriesByType && performance.getEntriesByType('navigation')[0] || {}).type || null } });
    setupSections();
  }
  function getCountry() {
    return new Promise(function (resolve) {
      if (base.country) return resolve();
      var done = false, to = setTimeout(function () { if (!done) { done = true; resolve(); } }, 1200);
      try {
        fetch('https://www.cloudflare.com/cdn-cgi/trace').then(function (r) { return r.text(); }).then(function (t) {
          var m = /loc=([A-Z]{2})/.exec(t);
          if (m) { base.country = m[1]; ls.set('levo_cc', m[1]); }
        }).catch(function () {}).then(function () { if (!done) { done = true; clearTimeout(to); resolve(); } });
      } catch (e) { resolve(); }
    });
  }
  function boot() { getCountry().then(function () { start(); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
