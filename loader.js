(function () {
  'use strict';

  var CONFIG = {
    logo: './logo_levo1.png',
    minShow: 1500,
    quickShow: 550,
    maxWait: 7000,
    text: 'بنجهّز المفاجأة...',
    onlyFirstVisitFull: true
  };

  var doc = document, root = doc.documentElement;
  if (doc.getElementById('levo-loader')) return;

  var seen = false;
  try { seen = sessionStorage.getItem('levo_seen') === '1'; } catch (e) {}
  var minShow = CONFIG.onlyFirstVisitFull && seen ? CONFIG.quickShow : CONFIG.minShow;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = '\
#levo-loader{--ink:#2B2140;--pink:#FF8FC7;--pink-deep:#FF5FA2;--yellow:#FFD84D;--teal:#5ED6C9;--purple:#B28DFF;\
position:fixed;inset:0;z-index:99999;display:grid;place-items:center;overflow:hidden;direction:ltr;\
background:radial-gradient(circle at 20% 15%,#ffe3f1 0,transparent 45%),radial-gradient(circle at 85% 85%,#ece2ff 0,transparent 45%),#FFD6E8;\
transition:transform .95s cubic-bezier(.76,0,.24,1),border-radius .95s cubic-bezier(.76,0,.24,1);will-change:transform}\
#levo-loader::before{content:"";position:absolute;inset:0;opacity:.5;pointer-events:none;\
background-image:radial-gradient(circle,rgba(43,33,64,.14) 1.5px,transparent 1.6px);background-size:28px 28px;\
animation:lvDots 14s linear infinite}\
@keyframes lvDots{to{background-position:56px 56px}}\
#levo-loader.lv-exit{transform:translateY(-102%);border-radius:0 0 50% 50%/0 0 14vh 14vh}\
#levo-loader .lv-center{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:clamp(22px,4vh,34px);padding:20px}\
#levo-loader .lv-logo-wrap{position:relative;width:min(300px,62vw);animation:lvIn 1s cubic-bezier(.34,1.56,.64,1) both}\
#levo-loader .lv-float{animation:lvFloat 3.2s ease-in-out 1s infinite}\
#levo-loader .lv-logo{display:block;width:100%;height:auto;filter:drop-shadow(5px 7px 0 rgba(43,33,64,.18))}\
#levo-loader .lv-shine{position:absolute;inset:0;pointer-events:none;\
-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;\
background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.85) 50%,transparent 65%);background-size:250% 100%;background-position:200% 0;\
animation:lvShine 2.6s ease-in-out 1.1s infinite}\
@keyframes lvIn{0%{opacity:0;transform:translateY(40px) scale(.45) rotate(-9deg)}60%{opacity:1}100%{opacity:1;transform:none}}\
@keyframes lvFloat{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-12px) rotate(1.2deg)}}\
@keyframes lvShine{0%{background-position:200% 0}55%,100%{background-position:-100% 0}}\
#levo-loader .lv-bar-block{display:flex;flex-direction:column;align-items:center;gap:12px;animation:lvUp .8s cubic-bezier(.22,.9,.3,1) .5s both}\
@keyframes lvUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}\
#levo-loader .lv-bar{position:relative;width:min(320px,70vw);height:20px;border:4px solid var(--ink);border-radius:999px;background:#fff;box-shadow:4px 4px 0 var(--ink);overflow:hidden}\
#levo-loader .lv-fill{position:absolute;inset:0 auto 0 0;width:0;border-radius:999px;\
background:repeating-linear-gradient(-45deg,var(--pink-deep) 0 12px,#ff7db6 12px 24px);background-size:34px 34px;\
animation:lvStripe 1s linear infinite}\
@keyframes lvStripe{to{background-position:34px 0}}\
#levo-loader .lv-meta{display:flex;align-items:center;gap:12px;font-family:"Lalezar","Baloo Bhaijaan 2",system-ui,sans-serif;color:var(--ink)}\
#levo-loader .lv-text{font-size:18px;direction:rtl;opacity:.85}\
#levo-loader .lv-pct{min-width:54px;text-align:center;font-size:17px;background:var(--yellow);border:3px solid var(--ink);border-radius:999px;padding:0 10px;box-shadow:2px 2px 0 var(--ink)}\
#levo-loader .lv-deco{position:absolute;z-index:1;pointer-events:none;opacity:0;animation:lvDeco 4.8s ease-in-out infinite}\
#levo-loader .lv-deco svg{display:block;width:100%;height:100%}\
@keyframes lvDeco{0%{opacity:0;transform:translateY(24px) scale(.5) rotate(0)}20%{opacity:1}75%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.1) rotate(18deg)}}\
#levo-loader.lv-leaving .lv-logo-wrap{animation:lvOut .6s cubic-bezier(.5,0,.75,0) forwards}\
#levo-loader.lv-leaving .lv-bar-block{animation:lvBarOut .4s ease forwards}\
@keyframes lvOut{to{transform:translateY(-30px) scale(1.12);opacity:0}}\
@keyframes lvBarOut{to{opacity:0;transform:translateY(10px)}}\
@media (prefers-reduced-motion:reduce){\
#levo-loader,#levo-loader *{animation-duration:.01ms!important;animation-iteration-count:1!important}\
#levo-loader{transition:opacity .3s ease!important}#levo-loader.lv-exit{transform:none;opacity:0}}';

  var style = doc.createElement('style');
  style.id = 'levo-loader-css';
  style.textContent = css;
  (doc.head || root).appendChild(style);

  var HEART = '<svg viewBox="0 0 100 100"><path d="M50 88C19 67 3 48 3 31 3 15 15 5 28 5c10 0 18 6 22 14 4-8 12-14 22-14 13 0 25 10 25 26 0 17-16 36-47 57z" fill="#FF5FA2" stroke="#2B2140" stroke-width="6" stroke-linejoin="round"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 1l2.6 7.4L22 11l-7.4 2.6L12 21l-2.6-7.4L2 11l7.4-2.6z" fill="#FFD84D" stroke="#2B2140" stroke-width="2" stroke-linejoin="round"/></svg>';
  var HEART2 = HEART.replace('#FF5FA2', '#B28DFF');
  var HEART3 = HEART.replace('#FF5FA2', '#5ED6C9');

  var decos = [
    { s: STAR, x: '14%', y: '68%', w: 30, d: '0s' },
    { s: HEART, x: '82%', y: '62%', w: 34, d: '1.1s' },
    { s: HEART2, x: '22%', y: '30%', w: 26, d: '2.2s' },
    { s: STAR, x: '76%', y: '24%', w: 24, d: '.6s' },
    { s: HEART3, x: '8%', y: '48%', w: 22, d: '3s' },
    { s: HEART, x: '90%', y: '40%', w: 24, d: '1.7s' }
  ].map(function (o) {
    return '<span class="lv-deco" style="left:' + o.x + ';top:' + o.y + ';width:' + o.w + 'px;height:' + o.w + 'px;animation-delay:' + o.d + '">' + o.s + '</span>';
  }).join('');

  var el = doc.createElement('div');
  el.id = 'levo-loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'جاري تحميل الموقع');
  el.innerHTML =
    decos +
    '<div class="lv-center">' +
      '<div class="lv-logo-wrap"><div class="lv-float">' +
        '<img class="lv-logo" src="' + CONFIG.logo + '" alt="Levo" draggable="false">' +
        '<span class="lv-shine" style="-webkit-mask-image:url(' + CONFIG.logo + ');mask-image:url(' + CONFIG.logo + ')"></span>' +
      '</div></div>' +
      '<div class="lv-bar-block">' +
        '<div class="lv-bar"><div class="lv-fill"></div></div>' +
        '<div class="lv-meta"><span class="lv-text">' + CONFIG.text + '</span><span class="lv-pct">0%</span></div>' +
      '</div>' +
    '</div>';
  root.appendChild(el);

  var prevOverflow = root.style.overflow;
  root.style.overflow = 'hidden';

  var fill = el.querySelector('.lv-fill');
  var pctEl = el.querySelector('.lv-pct');
  var start = performance.now();
  var ready = false, finished = false, p = 0;

  var pageLoaded = new Promise(function (resolve) {
    if (doc.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  var fontsReady = doc.fonts && doc.fonts.ready ? doc.fonts.ready.catch(function () {}) : Promise.resolve();
  var logoReady = new Promise(function (resolve) {
    var image = new Image();
    image.onload = image.onerror = resolve;
    image.src = CONFIG.logo;
  });

  Promise.all([pageLoaded, fontsReady, logoReady]).then(function () { ready = true; });
  setTimeout(function () { ready = true; }, CONFIG.maxWait);

  function render() {
    var elapsed = performance.now() - start;
    var target = ready ? 100 : Math.min(90, 90 * (1 - Math.exp(-elapsed / 1700)));
    p += (target - p) * (ready ? 0.12 : 0.07);
    if (p > 99.4) p = 100;
    fill.style.width = p + '%';
    pctEl.textContent = Math.round(p) + '%';

    if (ready && p >= 100 && elapsed >= minShow) return finish();
    requestAnimationFrame(render);
  }

  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('levo_seen', '1'); } catch (e) {}
    el.classList.add('lv-leaving');
    setTimeout(function () {
      el.classList.add('lv-exit');
      root.style.overflow = prevOverflow;
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var loaderStyle = doc.getElementById('levo-loader-css');
        if (loaderStyle && loaderStyle.parentNode) loaderStyle.parentNode.removeChild(loaderStyle);
        window.dispatchEvent(new Event('levo:loaded'));
      }, 1000);
    }, reduced ? 0 : 450);
  }

  requestAnimationFrame(render);
})();
