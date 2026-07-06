(function () {
  'use strict';

  var CFG = window.OG_CAROUSEL || {};
  var AI_ENABLED = CFG.ai !== false;
  var API_BASE = CFG.apiBase || '/api/generate-carousel';
  var ASSET_BASE = CFG.assetBase || '/linkedin-carousel/';
  var GATE_ENABLED = CFG.emailGate !== false; // course sets emailGate:false (members already known)

  // Apply the deployment mode: drop the copy that doesn't belong, flag layout for CSS.
  if (!AI_ENABLED) document.documentElement.classList.add('no-ai');
  (function pruneModeCopy() {
    var drop = document.querySelectorAll(AI_ENABLED ? '[data-noai-only]' : '[data-ai-only]');
    for (var i = 0; i < drop.length; i++) drop[i].parentNode.removeChild(drop[i]);
  })();

  /* =========================================================
     UI LANGUAGE (page chrome only — never touches the slides)
     ========================================================= */
  function applyPlaceholders(lang) {
    document.querySelectorAll('[data-ph-he]').forEach(function (el) {
      var val = el.getAttribute('data-ph-' + lang);
      if (val !== null) el.placeholder = val;
    });
  }
  function setUiLang(lang) {
    var html = document.documentElement;
    html.classList.toggle('lang-he', lang === 'he');
    html.classList.toggle('lang-en', lang === 'en');
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    applyPlaceholders(lang);
    try { localStorage.setItem('ogUiLang', lang); } catch (e) {}
  }
  window.toggleUiLang = function () {
    setUiLang(document.documentElement.classList.contains('lang-he') ? 'en' : 'he');
  };
  var savedUi = null;
  try { savedUi = localStorage.getItem('ogUiLang'); } catch (e) {}
  setUiLang(savedUi === 'en' ? 'en' : 'he');

  function uiLang() { return document.documentElement.classList.contains('lang-he') ? 'he' : 'en'; }

  /* =========================================================
     DATA
     ========================================================= */
  // User-facing palettes are deliberately NOT the OctaLoom brand colors (licensing/brand separation).
  // The brand palette exists only for the non-downloadable demo.
  var BRAND_PALETTE = { id: 'octaloom', name: 'OctaLoom', bg: '#201E4B', text: '#ECE9E7', accent: '#C6E7A3' };
  var BRAND_FONT_STACKS = { he: "'DiscoveryFs','Arial',sans-serif", en: "'Aeonik','Arial',sans-serif" };
  var PALETTES = [
    { id: 'midnight',  name: 'Midnight',  bg: '#0F172A', text: '#F8FAFC', accent: '#7DD3FC' },
    { id: 'ink',       name: 'Ink',       bg: '#111111', text: '#F5F5F5', accent: '#FFD166' },
    { id: 'plum',      name: 'Plum',      bg: '#3B1D54', text: '#F6EFFA', accent: '#FFB4A2' },
    { id: 'ocean',     name: 'Ocean',     bg: '#0C3B5D', text: '#EAF4F8', accent: '#5EEAD4' },
    { id: 'forest',    name: 'Forest',    bg: '#14342B', text: '#ECFDF5', accent: '#A7F3D0' },
    { id: 'wine',      name: 'Wine',      bg: '#4C0F2E', text: '#FBEFF4', accent: '#F9A8D4' },
    { id: 'sand',      name: 'Sand',      bg: '#F5EFE6', text: '#3E3A33', accent: '#C2410C' },
    { id: 'paper',     name: 'Paper',     bg: '#FAFAF8', text: '#1F2933', accent: '#2563EB' },
    { id: 'clean',     name: 'Clean',     bg: '#FFFFFF', text: '#18181B', accent: '#E11D48' }
  ];
  var FONTS = [
    { id: 'heebo',     name: 'Heebo',       stack: "'Heebo','Arial',sans-serif" },
    { id: 'rubik',     name: 'Rubik',       stack: "'Rubik','Arial',sans-serif" },
    { id: 'assistant', name: 'Assistant',   stack: "'Assistant','Arial',sans-serif" },
    { id: 'secular',   name: 'Secular One', stack: "'Secular One','Arial',sans-serif" }
  ];
  var ERROR_MSGS = {
    rate_limited: { he: 'יותר מדי בקשות. נסו שוב בעוד דקה.', en: 'Too many requests. Try again in a minute.' },
    bad_request:  { he: 'כתבו נושא לקרוסלה קודם.', en: 'Write a topic for your carousel first.' },
    ai_error:     { he: 'שגיאה ב-AI. נסו שוב.', en: 'AI error. Please try again.' },
    server_error: { he: 'שגיאת שרת. נסו שוב.', en: 'Server error. Please try again.' },
    network:      { he: 'שגיאת רשת. בדקו את החיבור ונסו שוב.', en: 'Network error. Check your connection and try again.' },
    fallback:     { he: 'שגיאה. נסו שוב.', en: 'Error. Please try again.' }
  };
  var BLANK_COPY = {
    he: {
      introTitle: 'כותרת חזקה נכנסת כאן', introBody: 'משפט אחד שגורם להמשיך להחליק.',
      title: 'כותרת השקף', body: 'טקסט קצר וממוקד. רעיון אחד לשקף.',
      outroTitle: 'שורת הסיום שלכם', outroBody: 'מה אתם רוצים שהקוראים יעשו עכשיו?'
    },
    en: {
      introTitle: 'Your catchy title goes here', introBody: 'One line that makes people keep swiping.',
      title: 'Section title', body: 'Short, focused text. One idea per slide.',
      outroTitle: 'Your closing note', outroBody: 'What do you want readers to do next?'
    }
  };
  var DEFAULT_SWIPE = { he: 'החליקו ←', en: 'Swipe →' };
  var PLACEHOLDER_AUTHOR = {
    he: { name: 'השם שלכם', handle: '@החברה שלכם' },
    en: { name: 'Your Name', handle: '@yourcompany' }
  };
  // A real confession-style (Mistake & Fix) sample so the demo shows the tool at its best.
  var DEMO_SLIDES = {
    he: [
      { role: 'intro',   title: 'חיסלתי את החשיפה שלי בלינקדאין', body: 'לקח לי חודשים להבין מה עשיתי לא נכון.' },
      { role: 'content', title: 'פרסמתי בלי עקביות', body: 'פוסט פעם בשבועיים, כשהתחשק לי. האלגוריתם שכח שאני קיימת בין פוסט לפוסט.' },
      { role: 'content', title: 'כתבתי על הכל', body: 'שיווק, פרודוקטיביות, קצת מהחיים. אף אחד לא ידע בשביל מה לעקוב אחריי.' },
      { role: 'content', title: 'רדפתי אחרי לייקים', body: 'כתבתי מה שנחמד, לא מה שנכון. תוכן שכולם אוהבים ואף אחד לא זוכר.' },
      { role: 'outro',   title: 'מה ששינה הכל', body: 'נושא אחד, קול אחד, קצב קבוע. תגיבו ואשלח לכם את המבנה המלא.' }
    ],
    en: [
      { role: 'intro',   title: 'How I killed my own LinkedIn reach', body: 'It took me months to see what I was doing wrong.' },
      { role: 'content', title: 'I posted with no consistency', body: 'Once every two weeks, whenever I felt like it. The algorithm forgot I existed between posts.' },
      { role: 'content', title: 'I wrote about everything', body: 'Marketing, productivity, a bit of life. Nobody knew what to follow me for.' },
      { role: 'content', title: 'I chased likes', body: 'I wrote what was nice, not what was true. Content everyone likes and nobody remembers.' },
      { role: 'outro',   title: 'What changed everything', body: 'One topic, one voice, a steady rhythm. Comment and I will send you the full structure.' }
    ]
  };

  // Default branding ships with Hanita's demo identity, exactly like typegrow ships Alex's.
  var DEFAULT_BRANDING = {
    name: 'Hanita Yudovski', handle: 'LinkedIn Led Marketer', photo: ASSET_BASE + 'hanita-li.jpg',
    showPhoto: true, showName: true, showHandle: true, introOutroOnly: false
  };
  var state = {
    contentLang: 'he',
    slides: [],
    caption: '',
    firstComment: '',
    architecture: '',
    branding: JSON.parse(JSON.stringify(DEFAULT_BRANDING)),
    design: { paletteId: 'midnight', fontId: 'heebo', custom: { bg: '#0F172A', text: '#F8FAFC', accent: '#7DD3FC' } },
    settings: { numbers: true, swipe: true, swipeTextHe: DEFAULT_SWIPE.he, swipeTextEn: DEFAULT_SWIPE.en }
  };
  var uid = 1;
  function newId() { return 's' + (uid++) + '-' + (state.slides.length); }
  // True while the slides are the untouched demo deck. The demo renders in the OctaLoom brand
  // look (colors + licensed fonts) and cannot be downloaded; any interaction exits demo mode
  // and switches to the user's own (freely licensed) design.
  var isDemo = false;
  function seedDemo() {
    state.slides = DEMO_SLIDES[state.contentLang].map(function (s) {
      return { id: newId(), role: s.role, title: s.title, body: s.body };
    });
    isDemo = true;
    updateDemoUi();
  }
  function exitDemo() {
    if (!isDemo) return;
    isDemo = false;
    updateDemoUi();
  }
  function updateDemoUi() {
    var badge = document.getElementById('demo-badge');
    if (badge) badge.style.display = isDemo ? 'block' : 'none';
    var note = document.getElementById('dl-demo-note');
    if (note && !isDemo) note.style.display = 'none';
  }

  /* =========================================================
     DRAFT PERSISTENCE
     ========================================================= */
  var DRAFT_KEY = 'ogCarouselDraft:v1';
  var saveTimer = null;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      } catch (e) {
        // QuotaExceeded — most likely the headshot dataURL; retry once without it
        try {
          var slim = JSON.parse(JSON.stringify(state));
          slim.branding.photo = null;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(slim));
        } catch (e2) {}
      }
    }, 400);
  }
  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.slides) || !d.slides.length) return false;
      state.contentLang = d.contentLang === 'en' ? 'en' : 'he';
      state.slides = d.slides.map(function (s) {
        return { id: s.id || newId(), role: s.role || 'content', title: String(s.title || ''), body: String(s.body || '') };
      });
      if (d.branding && (d.branding.name || d.branding.handle || d.branding.photo)) {
        state.branding = {
          name: String(d.branding.name || ''), handle: String(d.branding.handle || ''),
          // migrate drafts that still point at the removed first-version avatar
          photo: (d.branding.photo === '/linkedin-carousel/hanita.jpg' || d.branding.photo === '/linkedin-carousel/hanita-li.jpg') ? DEFAULT_BRANDING.photo : (d.branding.photo || null),
          introOutroOnly: !!d.branding.introOutroOnly,
          showPhoto: d.branding.showPhoto !== false,
          showName: d.branding.showName !== false,
          showHandle: d.branding.showHandle !== false
        };
      }
      // drafts saved before default branding existed (all fields empty) keep the defaults;
      // hiding branding is done with the show/hide toggles, not by emptying fields
      state.caption = String(d.caption || '');
      state.firstComment = String(d.firstComment || '');
      state.architecture = String(d.architecture || '');
      if (d.design && d.design.paletteId) state.design = {
        // old drafts may reference retired brand palettes; currentPalette() falls back to the first public one
        paletteId: d.design.paletteId,
        fontId: d.design.fontId || 'heebo',
        custom: d.design.custom || state.design.custom
      };
      if (d.settings) state.settings = {
        numbers: d.settings.numbers !== false, swipe: d.settings.swipe !== false,
        swipeTextHe: String(d.settings.swipeTextHe || DEFAULT_SWIPE.he),
        swipeTextEn: String(d.settings.swipeTextEn || DEFAULT_SWIPE.en)
      };
      return true;
    } catch (e) { return false; }
  }

  /* =========================================================
     ERRORS / LOADING
     ========================================================= */
  var errEl = document.getElementById('gen-error');
  function showError(codeOrMsg) {
    var m = ERROR_MSGS[codeOrMsg];
    errEl.textContent = m ? m[uiLang()] : codeOrMsg;
    errEl.style.display = 'block';
  }
  function hideError() { errEl.style.display = 'none'; }

  /* =========================================================
     SLIDE NODE — single source of truth for preview AND export
     ========================================================= */
  function currentPalette() {
    if (isDemo) return BRAND_PALETTE;
    if (state.design.paletteId === 'custom') return state.design.custom;
    for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i].id === state.design.paletteId) return PALETTES[i];
    return PALETTES[0];
  }
  function currentFont() {
    for (var i = 0; i < FONTS.length; i++) if (FONTS[i].id === state.design.fontId) return FONTS[i];
    return FONTS[0];
  }
  function swipeText() {
    return state.contentLang === 'he' ? state.settings.swipeTextHe : state.settings.swipeTextEn;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== '') n.textContent = text;
    return n;
  }
  function buildSlideNode(slide, index, total, forExport) {
    var pal = currentPalette();
    var node = el('div', 'slide slide-' + state.contentLang + ' slide-' + slide.role + (isDemo ? ' slide-brandfont' : ''));
    node.style.fontFamily = isDemo ? BRAND_FONT_STACKS[state.contentLang] : currentFont().stack;
    node.style.setProperty('--s-bg', pal.bg);
    node.style.setProperty('--s-text', pal.text);
    node.style.setProperty('--s-accent', pal.accent);
    node.setAttribute('dir', state.contentLang === 'he' ? 'rtl' : 'ltr');

    // top bar: accent bar on intro/outro, number chip on content slides
    var top = el('div', 'sl-topbar');
    if (slide.role === 'content' && state.settings.numbers) {
      top.appendChild(el('div', 'sl-num', String(index)));
    } else {
      top.appendChild(el('div', 'sl-accent-bar'));
    }
    node.appendChild(top);

    // main text — in the preview, empty fields show placeholder copy; the export only includes what was actually written
    var main = el('div', 'sl-main');
    var ph = BLANK_COPY[state.contentLang];
    var fallbackTitle = slide.role === 'intro' ? ph.introTitle : slide.role === 'outro' ? ph.outroTitle : ph.title;
    var fallbackBody = slide.role === 'intro' ? ph.introBody : slide.role === 'outro' ? ph.outroBody : ph.body;
    if (slide.title) {
      main.appendChild(el('h2', 'sl-title', slide.title));
    } else if (!forExport) {
      main.appendChild(el('h2', 'sl-title sl-placeholder', fallbackTitle));
    }
    if (slide.body) {
      main.appendChild(el('p', 'sl-body', slide.body));
    } else if (!forExport && !slide.title) {
      main.appendChild(el('p', 'sl-body sl-placeholder', fallbackBody));
    }
    node.appendChild(main);

    // footer: branding + swipe. Each element has its own on/off toggle; empty-but-on fields
    // show a dimmed placeholder in the preview and are omitted from the export.
    var b = state.branding;
    var showBrand = !b.introOutroOnly || slide.role !== 'content';
    var photoOn = b.showPhoto, nameOn = b.showName, handleOn = b.showHandle;
    var hasBrand = (photoOn && b.photo) || (nameOn && b.name) || (handleOn && b.handle);
    var showSwipe = state.settings.swipe && index < total && swipeText();
    var showAuthor = showBrand && (hasBrand || (!forExport && (photoOn || nameOn || handleOn)));
    if (showAuthor || showSwipe) {
      var foot = el('div', 'sl-footer');
      if (showAuthor) {
        if (photoOn && b.photo) {
          var img = document.createElement('img');
          img.className = 'sl-avatar';
          img.src = b.photo;
          img.alt = '';
          foot.appendChild(img);
        } else if (photoOn && !forExport) {
          foot.appendChild(el('div', 'sl-avatar-ph sl-placeholder', '☺'));
        }
        var pa = PLACEHOLDER_AUTHOR[state.contentLang];
        var author = el('div', 'sl-author');
        if (nameOn && b.name) {
          author.appendChild(el('p', 'sl-author-name', b.name));
        } else if (nameOn && !forExport) {
          author.appendChild(el('p', 'sl-author-name sl-placeholder', pa.name));
        }
        if (handleOn && b.handle) {
          author.appendChild(el('p', 'sl-author-handle', b.handle));
        } else if (handleOn && !forExport && !(nameOn && b.name)) {
          author.appendChild(el('p', 'sl-author-handle sl-placeholder', pa.handle));
        }
        foot.appendChild(author);
      }
      if (showSwipe) foot.appendChild(el('span', 'sl-swipe', swipeText()));
      node.appendChild(foot);
    }
    return node;
  }
  // Shrink text until it fits the slide. Node must be attached to the DOM.
  function fitSlide(node) {
    var main = node.querySelector('.sl-main');
    if (!main) return;
    var scale = 1;
    node.style.setProperty('--tscale', '1');
    var guard = 0;
    while (main.scrollHeight > main.clientHeight + 2 && scale > 0.5 && guard < 20) {
      scale *= 0.93;
      node.style.setProperty('--tscale', String(scale));
      guard++;
    }
  }

  /* =========================================================
     RENDER — preview strip
     ========================================================= */
  var previewStrip = document.getElementById('preview-strip');
  var pvCount = document.getElementById('pv-count');
  var editorWrap = document.getElementById('editor-wrap');
  function renderPreview() {
    previewStrip.innerHTML = '';
    var total = state.slides.length;
    state.slides.forEach(function (slide, i) {
      var frame = el('div', 'pv-frame');
      var node = buildSlideNode(slide, i + 1, total);
      frame.appendChild(node);
      previewStrip.appendChild(frame);
      fitSlide(node);
    });
    var isHe = uiLang() === 'he';
    pvCount.textContent = total ? (isHe ? total + ' שקפים · 1080×1350' : total + ' slides · 1080×1350') : '';
  }

  /* =========================================================
     RENDER — slides tab (rebuilt on structural changes only)
     ========================================================= */
  var slidesList = document.getElementById('slides-list');
  function badgeText(role) {
    var isHe = uiLang() === 'he';
    if (role === 'intro') return isHe ? 'פתיח' : 'Intro';
    if (role === 'outro') return isHe ? 'סיום' : 'Outro';
    return isHe ? 'תוכן' : 'Content';
  }
  function renderSlidesTab() {
    slidesList.innerHTML = '';
    var isHe = uiLang() === 'he';
    state.slides.forEach(function (slide, i) {
      var row = el('div', 'slide-row');

      var head = el('div', 'slide-row-head');
      head.appendChild(el('span', 'slide-badge b-' + slide.role, badgeText(slide.role)));
      var tools = el('div', 'slide-row-tools');
      var up = el('button', 'icon-btn', '↑'); up.type = 'button'; up.title = isHe ? 'הזזה למעלה' : 'Move up';
      var down = el('button', 'icon-btn', '↓'); down.type = 'button'; down.title = isHe ? 'הזזה למטה' : 'Move down';
      var del = el('button', 'icon-btn', '✕'); del.type = 'button'; del.title = isHe ? 'מחיקה' : 'Delete';
      up.disabled = i === 0;
      down.disabled = i === state.slides.length - 1;
      del.disabled = state.slides.length <= 2;
      up.onclick = function () { moveSlide(i, i - 1); };
      down.onclick = function () { moveSlide(i, i + 1); };
      del.onclick = function () { removeSlide(i); };
      tools.appendChild(up); tools.appendChild(down); tools.appendChild(del);
      head.appendChild(tools);
      row.appendChild(head);

      var titleIn = document.createElement('input');
      titleIn.type = 'text'; titleIn.maxLength = 120; titleIn.value = slide.title;
      titleIn.placeholder = isHe ? 'כותרת' : 'Title';
      titleIn.dir = state.contentLang === 'he' ? 'rtl' : 'ltr';
      titleIn.addEventListener('input', function () { slide.title = titleIn.value; exitDemo(); renderPreview(); saveDraft(); });
      row.appendChild(titleIn);

      var bodyIn = document.createElement('textarea');
      bodyIn.rows = 2; bodyIn.maxLength = 400; bodyIn.value = slide.body;
      bodyIn.placeholder = isHe ? 'טקסט' : 'Body';
      bodyIn.dir = state.contentLang === 'he' ? 'rtl' : 'ltr';
      bodyIn.addEventListener('input', function () { slide.body = bodyIn.value; exitDemo(); renderPreview(); saveDraft(); });
      row.appendChild(bodyIn);

      slidesList.appendChild(row);
    });
    document.getElementById('add-slide').disabled = state.slides.length >= 10;
  }
  function reassignRoles() {
    state.slides.forEach(function (s) { s.role = 'content'; });
    if (state.slides.length) {
      state.slides[0].role = 'intro';
      state.slides[state.slides.length - 1].role = 'outro';
    }
  }
  function structuralChange() {
    exitDemo();
    reassignRoles();
    renderSlidesTab();
    renderPreview();
    saveDraft();
  }
  function moveSlide(from, to) {
    if (to < 0 || to >= state.slides.length) return;
    var s = state.slides.splice(from, 1)[0];
    state.slides.splice(to, 0, s);
    structuralChange();
  }
  function removeSlide(i) {
    if (state.slides.length <= 2) return;
    state.slides.splice(i, 1);
    structuralChange();
  }
  document.getElementById('add-slide').addEventListener('click', function () {
    if (state.slides.length >= 10) return;
    // insert before the outro
    state.slides.splice(Math.max(1, state.slides.length - 1), 0, { id: newId(), role: 'content', title: '', body: '' });
    structuralChange();
  });

  /* =========================================================
     RENDER — branding / design / settings tabs
     ========================================================= */
  var photoPreview = document.getElementById('photo-preview');
  var photoRemove = document.getElementById('photo-remove');
  function renderBranding() {
    document.getElementById('brand-name').value = state.branding.name;
    document.getElementById('brand-handle').value = state.branding.handle;
    document.getElementById('brand-intro-outro').checked = state.branding.introOutroOnly;
    document.getElementById('brand-show-photo').checked = state.branding.showPhoto;
    document.getElementById('brand-show-name').checked = state.branding.showName;
    document.getElementById('brand-show-handle').checked = state.branding.showHandle;
    photoPreview.innerHTML = '';
    if (state.branding.photo) {
      var img = document.createElement('img');
      img.src = state.branding.photo; img.alt = '';
      photoPreview.appendChild(img);
      photoRemove.style.display = '';
    } else {
      photoPreview.textContent = '☺';
      photoRemove.style.display = 'none';
    }
  }
  document.getElementById('brand-name').addEventListener('input', function () {
    state.branding.name = this.value; renderPreview(); saveDraft();
  });
  document.getElementById('brand-handle').addEventListener('input', function () {
    state.branding.handle = this.value; renderPreview(); saveDraft();
  });
  document.getElementById('brand-intro-outro').addEventListener('change', function () {
    state.branding.introOutroOnly = this.checked; renderPreview(); saveDraft();
  });
  [['brand-show-photo', 'showPhoto'], ['brand-show-name', 'showName'], ['brand-show-handle', 'showHandle']].forEach(function (pair) {
    document.getElementById(pair[0]).addEventListener('change', function () {
      state.branding[pair[1]] = this.checked; renderPreview(); saveDraft();
    });
  });
  document.getElementById('photo-pick').addEventListener('click', function () {
    document.getElementById('photo-input').click();
  });
  photoRemove.addEventListener('click', function () {
    state.branding.photo = null; renderBranding(); renderPreview(); saveDraft();
  });
  document.getElementById('photo-input').addEventListener('change', function () {
    var file = this.files && this.files[0];
    this.value = '';
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      // Downscale to max 512px so localStorage and canvas memory stay sane
      var img = new Image();
      img.onload = function () {
        var max = 512;
        var w = img.width, h = img.height;
        var k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        state.branding.photo = c.toDataURL('image/jpeg', 0.88);
        renderBranding(); renderPreview(); saveDraft();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  var paletteGrid = document.getElementById('palette-grid');
  var customColors = document.getElementById('custom-colors');
  var fontChips = document.getElementById('font-chips');
  function renderFonts() {
    fontChips.innerHTML = '';
    FONTS.forEach(function (f) {
      var chip = el('button', 'font-chip' + (state.design.fontId === f.id ? ' on' : ''), f.name);
      chip.type = 'button';
      chip.style.fontFamily = f.stack;
      chip.onclick = function () {
        state.design.fontId = f.id;
        exitDemo();
        renderFonts(); renderPreview(); saveDraft();
      };
      fontChips.appendChild(chip);
    });
  }
  function renderPalettes() {
    renderFonts();
    paletteGrid.innerHTML = '';
    PALETTES.forEach(function (p) {
      paletteGrid.appendChild(paletteChip(p.id, p.name, p));
    });
    paletteGrid.appendChild(paletteChip('custom', 'Custom', state.design.custom));
    customColors.classList.toggle('on', state.design.paletteId === 'custom');
    document.getElementById('cc-bg').value = state.design.custom.bg;
    document.getElementById('cc-text').value = state.design.custom.text;
    document.getElementById('cc-accent').value = state.design.custom.accent;
  }
  function paletteChip(id, name, colors) {
    var chip = el('button', 'palette-chip' + (state.design.paletteId === id ? ' on' : ''));
    chip.type = 'button';
    var sw = el('div', 'palette-swatch');
    sw.style.background = colors.bg;
    var mid = el('i'); mid.style.background = colors.text; mid.style.insetInlineStart = '33.3%'; mid.style.opacity = '.85';
    var end = el('i'); end.style.background = colors.accent; end.style.insetInlineEnd = '0';
    sw.appendChild(mid); sw.appendChild(end);
    chip.appendChild(sw);
    chip.appendChild(el('div', 'palette-name', name));
    chip.onclick = function () {
      state.design.paletteId = id;
      exitDemo();
      renderPalettes(); renderPreview(); saveDraft();
    };
    return chip;
  }
  ['cc-bg', 'cc-text', 'cc-accent'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      state.design.custom[id.replace('cc-', '')] = this.value;
      state.design.paletteId = 'custom';
      exitDemo();
      renderPreview(); saveDraft();
      customColors.classList.add('on');
      // refresh the custom chip swatch without rebuilding while dragging
      var chips = paletteGrid.querySelectorAll('.palette-chip');
      var last = chips[chips.length - 1];
      if (last) {
        var sw = last.querySelector('.palette-swatch');
        sw.style.background = state.design.custom.bg;
        var iEls = sw.querySelectorAll('i');
        iEls[0].style.background = state.design.custom.text;
        iEls[1].style.background = state.design.custom.accent;
        chips.forEach(function (c) { c.classList.remove('on'); });
        last.classList.add('on');
      }
    });
  });

  function renderSettings() {
    document.getElementById('set-numbers').checked = state.settings.numbers;
    document.getElementById('set-swipe').checked = state.settings.swipe;
    document.getElementById('set-swipe-text').value = swipeText();
    document.getElementById('set-swipe-text').dir = state.contentLang === 'he' ? 'rtl' : 'ltr';
  }
  document.getElementById('set-numbers').addEventListener('change', function () {
    state.settings.numbers = this.checked; renderPreview(); saveDraft();
  });
  document.getElementById('set-swipe').addEventListener('change', function () {
    state.settings.swipe = this.checked; renderPreview(); saveDraft();
  });
  document.getElementById('set-swipe-text').addEventListener('input', function () {
    if (state.contentLang === 'he') state.settings.swipeTextHe = this.value;
    else state.settings.swipeTextEn = this.value;
    renderPreview(); saveDraft();
  });

  /* Post kit: caption + first comment */
  var ARCH_LABELS = {
    'show-your-work': { he: 'מאחורי הקלעים (Show Your Work)', en: 'Show Your Work' },
    'guide': { he: 'המדריך (PAS)', en: 'The Guide (PAS)' },
    'strong-pov': { he: 'דעה חדה (Strong POV)', en: 'Strong POV' },
    'mistake-and-fix': { he: 'טעות ותיקון (Mistake & Fix)', en: 'Mistake & Fix' }
  };
  function renderPostKit() {
    var kit = document.getElementById('post-kit');
    var has = state.caption || state.firstComment;
    kit.style.display = has ? 'flex' : 'none';
    if (!has) return;
    document.getElementById('caption-text').value = state.caption;
    document.getElementById('comment-text').value = state.firstComment;
    var noteEl = document.getElementById('arch-note');
    var arch = ARCH_LABELS[state.architecture];
    if (arch) {
      var isHe = uiLang() === 'he';
      noteEl.textContent = (isHe ? 'ארכיטקטורת הסיפור שנבחרה: ' : 'Storytelling architecture: ') + arch[isHe ? 'he' : 'en'];
      noteEl.style.display = '';
    } else {
      noteEl.style.display = 'none';
    }
  }
  document.getElementById('caption-text').addEventListener('input', function () {
    state.caption = this.value; saveDraft();
  });
  document.getElementById('comment-text').addEventListener('input', function () {
    state.firstComment = this.value; saveDraft();
  });
  function wireCopy(btnId, getText) {
    var btn = document.getElementById(btnId);
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(getText()).then(function () {
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 1500);
      });
    });
  }
  wireCopy('copy-caption', function () { return state.caption; });
  wireCopy('copy-comment', function () { return state.firstComment; });

  /* Tabs */
  document.getElementById('tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    document.querySelectorAll('#tabs button').forEach(function (b) { b.classList.toggle('on', b === btn); });
    document.querySelectorAll('.tab-body').forEach(function (tb) {
      tb.classList.toggle('on', tb.getAttribute('data-tab-body') === btn.getAttribute('data-tab'));
    });
  });

  /* =========================================================
     CONTENT LANGUAGE SEG
     ========================================================= */
  var seg = document.getElementById('content-lang-seg');
  function renderSeg() {
    seg.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-val') === state.contentLang);
    });
  }
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-val]');
    if (!b) return;
    state.contentLang = b.getAttribute('data-val');
    if (isDemo) seedDemo(); // untouched demo deck follows the carousel language
    renderSeg(); renderSettings();
    if (state.slides.length) { renderSlidesTab(); renderPreview(); }
    saveDraft();
  });

  /* =========================================================
     GENERATE / BLANK START
     ========================================================= */
  var loadingEl = document.getElementById('gen-loading');
  var submitBtn = document.getElementById('gen-submit');
  function showEditor() {
    editorWrap.style.display = 'block';
    renderSlidesTab(); renderBranding(); renderPalettes(); renderSettings(); renderSeg(); renderPreview(); renderPostKit();
  }
  function seedBlank(count) {
    var slides = [];
    for (var i = 0; i < count; i++) slides.push({ id: newId(), role: 'content', title: '', body: '' });
    state.slides = slides;
    reassignRoles();
  }
  document.getElementById('blank-start').addEventListener('click', function () {
    hideError();
    seedBlank(parseInt(document.getElementById('gen-count').value, 10) || 5);
    state.caption = ''; state.firstComment = ''; state.architecture = '';
    exitDemo();
    showEditor(); saveDraft();
    editorWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('gen-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!AI_ENABLED) return; // free version: AI generation is not available
    hideError();
    var topic = document.getElementById('gen-topic').value.trim();
    if (!topic) { showError('bad_request'); document.getElementById('gen-topic').focus(); return; }
    var count = parseInt(document.getElementById('gen-count').value, 10) || 5;

    submitBtn.disabled = true;
    loadingEl.style.display = 'block';
    try {
      var res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic, language: state.contentLang, slideCount: count })
      });
      var data = null;
      try { data = await res.json(); } catch (e2) {}
      if (!res.ok || !data || !Array.isArray(data.slides)) {
        showError((data && data.error) || 'server_error');
        return;
      }
      state.slides = data.slides.slice(0, 10).map(function (s) {
        return { id: newId(), role: s.role || 'content', title: String(s.title || ''), body: String(s.body || '') };
      });
      state.caption = String(data.caption || '');
      state.firstComment = String(data.first_comment || '');
      state.architecture = String(data.architecture || '');
      exitDemo();
      reassignRoles();
      showEditor(); saveDraft();
      editorWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError('network');
    } finally {
      submitBtn.disabled = false;
      loadingEl.style.display = 'none';
    }
  });

  /* =========================================================
     EXPORT — email gate → rasterize → PDF
     ========================================================= */
  var GATE_KEY = 'ogCarouselEmailDone';
  var dlBtn = document.getElementById('dl-btn');
  var dlProgress = document.getElementById('dl-progress');
  var modal = document.getElementById('email-modal');

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  var libsPromise = null;
  function ensureLibs() {
    if (!libsPromise) {
      libsPromise = Promise.all([
        window.htmlToImage ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js'),
        (window.jspdf && window.jspdf.jsPDF) ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js')
      ]).catch(function (e) { libsPromise = null; throw e; });
    }
    return libsPromise;
  }

  dlBtn.addEventListener('click', function () {
    if (isDemo) {
      // The demo carries the OctaLoom brand look and is preview-only
      var note = document.getElementById('dl-demo-note');
      note.style.display = 'block';
      dlBtn.classList.remove('shake');
      void dlBtn.offsetWidth;
      dlBtn.classList.add('shake');
      return;
    }
    if (!GATE_ENABLED) { exportPdf(); return; } // course members are already known, no gate
    var done = false;
    try { done = !!localStorage.getItem(GATE_KEY); } catch (e) {}
    if (done) { exportPdf(); return; }
    modal.classList.add('on');
    setTimeout(function () { document.getElementById('gate-email').focus(); }, 60);
  });
  document.getElementById('modal-close').addEventListener('click', function () {
    modal.classList.remove('on');
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.classList.remove('on');
  });
  document.getElementById('email-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = document.getElementById('gate-email').value.trim();
    var name = document.getElementById('gate-name').value.trim();
    if (!email) return;
    var btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'linkedin-carousel', name: name, email: email, lang: uiLang() })
      });
    } catch (err) { /* soft gate — never block the download */ }
    try { localStorage.setItem(GATE_KEY, '1'); } catch (err) {}
    btn.disabled = false;
    modal.classList.remove('on');
    exportPdf();
  });

  var exporting = false;
  async function exportPdf() {
    if (exporting || !state.slides.length) return;
    exporting = true;
    dlBtn.disabled = true;
    var isHe = uiLang() === 'he';
    var holder = document.getElementById('export-holder');
    try {
      dlProgress.textContent = isHe ? 'טוענים את מנוע ה-PDF...' : 'Loading the PDF engine...';
      await ensureLibs();

      // Fonts must be resolved before rasterizing, or glyphs drop
      dlProgress.textContent = isHe ? 'מכינים פונטים...' : 'Preparing fonts...';
      try {
        await Promise.all([
          document.fonts.load('700 64px ' + currentFont().name),
          document.fonts.load('400 64px ' + currentFont().name),
          document.fonts.load('700 64px ' + currentFont().name, 'אבג ABC'),
          document.fonts.ready
        ]);
      } catch (e) {}

      var total = state.slides.length;
      var opts = { pixelRatio: 2, quality: 0.92, width: 1080, height: 1350, backgroundColor: currentPalette().bg };

      // Safari warm-up: first foreignObject render can miss fonts/images — render once and discard
      holder.innerHTML = '';
      var warm = buildSlideNode(state.slides[0], 1, total, true);
      holder.appendChild(warm);
      fitSlide(warm);
      try { await htmlToImage.toJpeg(warm, opts); } catch (e) {}
      holder.innerHTML = '';

      var pdf = new jspdf.jsPDF({
        orientation: 'portrait', unit: 'px', format: [1080, 1350],
        hotfixes: ['px_scaling'], compress: true
      });

      for (var i = 0; i < total; i++) {
        dlProgress.textContent = isHe
          ? 'מייצרים שקף ' + (i + 1) + ' מתוך ' + total + '...'
          : 'Rendering slide ' + (i + 1) + ' of ' + total + '...';
        var node = buildSlideNode(state.slides[i], i + 1, total, true);
        holder.appendChild(node);
        fitSlide(node);
        var dataUrl = await htmlToImage.toJpeg(node, opts);
        holder.innerHTML = '';
        if (i > 0) pdf.addPage([1080, 1350], 'portrait');
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1080, 1350);
        // let mobile Safari release canvas memory between slides
        await new Promise(function (r) { setTimeout(r, 60); });
      }

      pdf.save('linkedin-carousel.pdf');
      dlProgress.textContent = isHe ? 'מוכן! ה-PDF ירד למחשב.' : 'Done! Your PDF is downloading.';
      setTimeout(function () { dlProgress.textContent = ''; }, 6000);
    } catch (err) {
      console.error('export failed:', err);
      dlProgress.textContent = isHe ? 'הייצוא נכשל. נסו שוב.' : 'Export failed. Please try again.';
    } finally {
      holder.innerHTML = '';
      dlBtn.disabled = false;
      exporting = false;
    }
  }

  /* =========================================================
     TAB TOUR — animated coachmarks explaining the four tabs
     ========================================================= */
  var TOUR_KEY = 'ogCarouselTourDone:v1';
  var TOUR_STEPS = [
    { tab: 'slides',
      he: { t: 'שקפים', d: 'כאן עורכים את הטקסט של כל שקף. החצים משנים סדר, האיקס מוחק, והכפתור למטה מוסיף שקף חדש. כל שינוי מתעדכן מיד בתצוגה.' },
      en: { t: 'Slides', d: 'Edit each slide\'s text here. Arrows reorder, X deletes, and the button below adds a slide. Every change updates the preview instantly.' } },
    { tab: 'branding',
      he: { t: 'מיתוג', d: 'התמונה, השם והטייטל שמופיעים על השקפים. לכל אחד מתג הפעלה משלו, ואפשר להציג אותם רק בשקף הפתיחה והסיום.' },
      en: { t: 'Branding', d: 'The photo, name and title that appear on your slides. Each has its own toggle, and you can limit them to the intro and outro slides.' } },
    { tab: 'design',
      he: { t: 'עיצוב', d: 'בוחרים פונט ופלטת צבעים לקרוסלה, או מגדירים צבעים מותאמים. הפונטים חופשיים לשימוש מסחרי.' },
      en: { t: 'Design', d: 'Pick a font and color palette, or set custom colors. All fonts are free for commercial use.' } },
    { tab: 'settings',
      he: { t: 'הגדרות', d: 'שפת הקרוסלה (עברית או אנגלית), מספרי השקפים וטקסט ההחלקה בפינת כל שקף.' },
      en: { t: 'Settings', d: 'The carousel language (Hebrew or English), slide numbers, and the swipe hint text on each slide.' } }
  ];
  var tourIdx = -1, tourPop = null;
  function tourTabBtn(tab) { return document.querySelector('#tabs button[data-tab="' + tab + '"]'); }
  function endTour() {
    tourIdx = -1;
    if (tourPop) { tourPop.remove(); tourPop = null; }
    document.querySelectorAll('.tour-pulse').forEach(function (b) { b.classList.remove('tour-pulse'); });
    window.removeEventListener('resize', positionTour);
    window.removeEventListener('scroll', positionTour, true);
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {}
  }
  function positionTour() {
    if (tourIdx < 0 || !tourPop) return;
    var btn = tourTabBtn(TOUR_STEPS[tourIdx].tab);
    var r = btn.getBoundingClientRect();
    var popW = tourPop.offsetWidth;
    var left = Math.min(Math.max(r.left + r.width / 2 - popW / 2, 16), window.innerWidth - popW - 16);
    tourPop.style.top = (r.bottom + 12) + 'px';
    tourPop.style.left = left + 'px';
    var isRtl = document.documentElement.dir === 'rtl';
    var arrowFromStart = isRtl ? (left + popW - (r.left + r.width / 2) - 6) : (r.left + r.width / 2 - left - 6);
    tourPop.style.setProperty('--arrow-x', arrowFromStart + 'px');
  }
  function showTourStep() {
    var step = TOUR_STEPS[tourIdx];
    var isHe = uiLang() === 'he';
    var txt = step[isHe ? 'he' : 'en'];
    document.querySelectorAll('.tour-pulse').forEach(function (b) { b.classList.remove('tour-pulse'); });
    var btn = tourTabBtn(step.tab);
    btn.classList.add('tour-pulse');
    btn.click(); // switch to the tab being explained so the user sees it live
    if (!tourPop) {
      tourPop = el('div', 'tour-pop');
      document.body.appendChild(tourPop);
    }
    tourPop.innerHTML = '';
    tourPop.appendChild(el('h4', '', txt.t));
    tourPop.appendChild(el('p', '', txt.d));
    var foot = el('div', 'tour-foot');
    var dots = el('div', 'tour-dots');
    TOUR_STEPS.forEach(function (_, i) { dots.appendChild(el('i', i === tourIdx ? 'on' : '')); });
    foot.appendChild(dots);
    var skip = el('button', 'tour-skip', isHe ? 'דילוג' : 'Skip');
    skip.type = 'button'; skip.onclick = endTour;
    var next = el('button', 'tour-next', tourIdx === TOUR_STEPS.length - 1 ? (isHe ? 'סיימנו' : 'Done') : (isHe ? 'הבא' : 'Next'));
    next.type = 'button';
    next.onclick = function () {
      if (tourIdx === TOUR_STEPS.length - 1) { endTour(); tourTabBtn('slides').click(); }
      else { tourIdx++; showTourStep(); }
    };
    if (tourIdx < TOUR_STEPS.length - 1) foot.appendChild(skip);
    foot.appendChild(next);
    tourPop.appendChild(foot);
    // restart the pop-in animation on each step
    tourPop.style.animation = 'none';
    void tourPop.offsetWidth;
    tourPop.style.animation = '';
    positionTour();
  }
  function startTour() {
    if (tourIdx >= 0) return;
    tourIdx = 0;
    window.addEventListener('resize', positionTour);
    window.addEventListener('scroll', positionTour, true);
    showTourStep();
  }
  document.getElementById('tour-replay').addEventListener('click', startTour);

  /* =========================================================
     INIT — like typegrow, the editor opens with a demo carousel
     so the preview (title, author, photo slots) is visible
     before anything is typed. Generate replaces the copy;
     branding and design carry over.
     ========================================================= */
  if (!loadDraft()) seedDemo();
  showEditor();
  updateDemoUi();
  // First visit: run the tab tour once the layout has settled
  var tourDone = false;
  try { tourDone = !!localStorage.getItem(TOUR_KEY); } catch (e) {}
  if (!tourDone) setTimeout(startTour, 900);
})();
