/* Filter Bar: a reusable search field and rubber segment filter for Webflow CMS lists.
   Wrap it in a script tag and paste it into a Code Embed (or a Component), page settings, or site settings.
   It finds every [data-filter-bar] on the page and adds behavior only. All design comes from your own Webflow classes. */
(() => {
  if (window.filterBarLoaded) return;   // safe to include more than once, like a Component used twice on a page
  window.filterBarLoaded = true;

  // Functional CSS only: positioning, hiding and hit areas. Colors, sizes and spacing stay in your classes.
  // The empty message stays hidden until the script finds no matches, and the thumb stays hidden until it's
  // placed, so neither flashes on page load. That needs this CSS in place before the bar draws: load the script
  // in the page's head, or in a Code Embed above the bar.
  const STYLE = `
[data-filter-item][hidden],[data-filter-pagination][hidden]{display:none!important}
[data-filter-empty]:not([data-filter-show]){display:none!important}
[data-filter-thumb]:not([data-filter-ready]){visibility:hidden}
[data-filter-prev],[data-filter-next],[data-filter-page]{cursor:pointer}
[data-filter-options]{position:relative;touch-action:pan-y;-webkit-user-select:none;user-select:none}
[data-filter-options] input,[data-filter-options] textarea{-webkit-user-select:text;user-select:text}
[data-filter-option]{cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}
[data-filter-options]:has([data-filter-option]:focus-visible){outline:2px solid var(--filter-focus,currentColor);outline-offset:var(--filter-focus-offset,2px)}
[data-filter-thumb]{position:absolute!important;inset:0!important;margin:0!important;padding:0!important;border:0!important;box-sizing:border-box;pointer-events:none}
[data-filter-thumb]>*{position:absolute!important;margin:0!important;box-sizing:border-box!important}
[data-filter-thumb] *{color:inherit!important;background:none!important;border-color:transparent!important;box-shadow:none!important}
[data-fit-photo]{margin-bottom:calc(-1*var(--fit-extra,0px))}
[data-fit-photo]~*{position:relative}
[data-filter-repeat]{display:none!important}`;
  document.head.append(Object.assign(document.createElement('style'), { textContent: STYLE }));

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(.3,.7,.2,1)', GLIDE_MS = 150;
  const q = (sel, root = document) => [...root.querySelectorAll(sel)];
  const attr = (name, value) => `[${name}="${CSS.escape(value)}"]`;
  const num = (v, fallback) => (v === undefined || v === '' || isNaN(v) ? fallback : +v);
  const groups = new Map();   // group name -> controllers of every bar that filters it

  // Height of every line past the first inside el (0 when it fits on one line)
  const wrapExtra = el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = [...range.getClientRects()].map(x => x.top).sort((a, b) => a - b);
    const lines = tops.filter((t, i) => i === 0 || t - tops[i - 1] > 2).length;
    const cs = getComputedStyle(el);
    const h = el.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return lines > 1 ? h * (lines - 1) / lines : 0;
  };

  function createBar(bar) {
    const group = bar.dataset.filterBar;
    const field = bar.dataset.filterField;
    const valueSel = field ? attr('data-filter-value', field) : '[data-filter-value]';
    const search = bar.querySelector('[data-filter-search]');
    const box = bar.matches('[data-filter-options]') ? bar : bar.querySelector('[data-filter-options]');   // the bar can be its own track
    const duration = num(bar.dataset.filterDuration, 420), squash = num(bar.dataset.filterSquash, 3);

    const query = () => (search ? search.value.trim() : '');
    const searchText = item => {
      const els = q('[data-filter-search-text]', item);
      return (els.length ? els.map(e => e.textContent).join(' ') : item.textContent).toLowerCase();
    };
    if (search) {
      search.setAttribute('autocomplete', 'off');
      search.addEventListener('input', () => applyGroup(group));
      search.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });   // never submits a Webflow form
    }

    const api = { el: bar, matches: item => !query() || searchText(item).includes(query().toLowerCase()), label: () => '', query, sync() {} };
    if (!box) return api;   // search-only bar
    const template = box.querySelector('[data-filter-option]');
    const thumb = box.querySelector('[data-filter-thumb]');
    if (!template || !thumb) {
      console.warn('Filter Bar: [data-filter-options] needs one [data-filter-option] (the "All" option) and one [data-filter-thumb].', bar);
      return api;
    }

    box.setAttribute('role', 'radiogroup');
    box.setAttribute('aria-label', bar.dataset.filterLabel || 'Filter');
    thumb.setAttribute('aria-hidden', 'true');
    template.dataset.filterOptionValue = '';
    let slots = [template], active = 0, anim = null, drag = null, suppressClick = false;
    // No visible search field (left off the page, or hidden with Display: None, at any breakpoint): the filters get
    // the spread combo class, so one Component works with and without search. Checked again whenever the layout
    // changes, so a search field hidden at only some breakpoints spreads the filters only there.
    const spreadClass = bar.dataset.filterSpreadClass || 'is-spread';
    const setSpread = () => {
      const on = !search || search.getClientRects().length === 0;
      [...slots, ...thumb.children].forEach(el => el.classList.toggle(spreadClass, on));
    };
    const fullName = new Map();   // value text -> full name from data-filter-name
    const value = () => slots[active].dataset.filterOptionValue;

    const make = name => {
      const el = template.cloneNode(true);
      el.removeAttribute('id');
      (el.querySelector('[data-filter-option-label]') || el).textContent = name;
      el.dataset.filterOptionValue = name;
      return el;
    };

    // The thumb holds a copy of every label, each placed exactly over its real option, clipped to the
    // active one. Placing by position (not by copying layout) lets the track hold other things, like the search field.
    // Rects are sub-pixel and carry top and bottom, because options can wrap onto more than one line
    const origin = () => thumb.getBoundingClientRect();
    const rect = i => {
      const s = slots[i].getBoundingClientRect(), o = origin();
      return [s.left - o.left, s.right - o.left, s.top - o.top, s.bottom - o.top];
    };
    const sameLine = (a, b) => Math.abs(a[2] - b[2]) < 1;
    const clip = ([l, r, t, b]) => {
      const o = origin(), round = parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;
      return `inset(${t}px ${o.width - r}px ${o.height - b}px ${l}px round ${round}px)`;
    };
    const current = () => {
      // Browsers shorten inset() when sides match, e.g. "inset(3px 121px round 7px)"
      const m = getComputedStyle(thumb).clipPath.match(/inset\(([^)]*?)(?:\s+round\b|\))/);
      if (!m) return null;
      const [t, r = t, b = t, l = r] = m[1].trim().split(/\s+/).map(parseFloat);
      const o = origin();
      return [l, o.width - r, t, o.height - b];
    };
    const place = () => {
      anim?.cancel();
      setSpread();   // before measuring, since spreading changes every option's width
      [...thumb.children].forEach((c, i) => {
        const [l, r, t, b] = rect(i);
        Object.assign(c.style, { left: `${l}px`, top: `${t}px`, width: `${r - l}px`, height: `${b - t}px` });
      });
      thumb.style.clipPath = clip(rect(active));
      thumb.setAttribute('data-filter-ready', '');
    };

    function animateTo(frames) {
      anim?.cancel();
      thumb.style.clipPath = clip(frames.at(-1));
      if (reduceMotion.matches || !duration) return;
      const offsets = frames.length === 4 ? [0, .45, .8, 1] : [0, 1];
      anim = thumb.animate(frames.map((f, k) => ({ clipPath: clip(f), offset: offsets[k], easing: EASE })), { duration });
    }

    function mark() {
      slots.forEach((s, k) => {
        s.setAttribute('role', 'radio');
        s.setAttribute('aria-checked', String(k === active));
        s.tabIndex = k === active ? 0 : -1;
      });
    }

    function select(i) {
      const to = rect(i), from = current() ?? to;
      active = i;
      mark();
      const [l, r, t, b] = to, [fl, fr, ft, fb] = from;
      if (!sameLine(from, to)) {                // other line: stretch across both lines, then the far edge squashes and relaxes
        animateTo([from, [l, r, Math.min(t, ft), Math.max(b, fb)], t > ft ? [l, r, t + squash, b] : [l, r, t, b - squash], to]);
      } else if (l > fl) {                      // stretch right, then the trailing edge lands past and relaxes
        animateTo([from, [fl, r, t, b], [l + squash, r, t, b], to]);
      } else if (l < fl) {
        animateTo([from, [l, fr, t, b], [l, r - squash, t, b], to]);
      } else {
        animateTo([from, to]);
      }
      applyGroup(group, false, true);
    }

    // Options come from the items' [data-filter-value] text: A to Z, or CMS order with data-filter-sort="cms".
    // Runs again whenever items are added, so new values get an option and vanished ones lose theirs.
    // A value's data-filter-name (like "Indiana" for "IN") becomes the option's screen reader name and the count's wording.
    function sync() {
      const els = q(`${attr('data-filter-item', group)} ${valueSel}`);
      els.forEach(e => { const full = e.dataset.filterName?.trim(); if (full) fullName.set(e.textContent.trim(), full); });
      const names = [...new Set(els.map(e => e.textContent.trim()).filter(Boolean))];
      if (bar.dataset.filterSort !== 'cms') names.sort((a, b) => a.localeCompare(b));
      const keep = value(), byValue = new Map(slots.map(s => [s.dataset.filterOptionValue, s]));
      const next = [template, ...names.map(n => byValue.get(n) || make(n))];
      slots.filter(s => !next.includes(s)).forEach(s => s.remove());
      next.forEach(s => {
        const full = fullName.get(s.dataset.filterOptionValue);
        if (full) s.setAttribute('aria-label', full);
        box.insertBefore(s, thumb);
      });
      slots = next;
      active = Math.max(0, slots.findIndex(s => s.dataset.filterOptionValue === keep));
      mark();
      thumb.replaceChildren(...slots.map(s => {
        const c = s.cloneNode(true);
        ['id', 'role', 'tabindex', 'aria-checked', 'aria-label', 'data-filter-option'].forEach(a => c.removeAttribute(a));
        return c;
      }));
      slots.forEach(s => placeRO.observe(s));
      place();
    }

    // One listener for every option, so options added later work too
    box.addEventListener('click', e => {
      const k = slots.indexOf(e.target.closest('[data-filter-option]'));
      if (k < 0) return;
      e.preventDefault();   // options built from Webflow Buttons are links
      if (!suppressClick && k !== active) select(k);
    });

    box.addEventListener('keydown', e => {
      const k = slots.indexOf(document.activeElement);
      if (k < 0) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); return; }
      const next = { ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1, ArrowUp: k - 1, Home: 0, End: slots.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      const n = (next + slots.length) % slots.length;
      select(n);
      slots[n].focus();
    });

    // Drag and flick the thumb along its own line
    box.addEventListener('pointerdown', e => {
      suppressClick = false;
      const o = origin(), x = e.clientX - o.left, y = e.clientY - o.top;
      const [l, r, t, b] = rect(active);
      if (x < l || x > r || y < t || y > b) return;
      const line = slots.map((_, k) => k).filter(k => sameLine(rect(k), rect(active)));
      drag = { x0: e.clientX, l, w: r - l, t, b, line, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0, id: e.pointerId };
    });
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved) {
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        box.setPointerCapture(drag.id);
        anim?.cancel();
      }
      const min = rect(drag.line[0])[0], max = rect(drag.line.at(-1))[1] - drag.w;
      const l = Math.min(max, Math.max(min, drag.l + dx));
      thumb.style.clipPath = clip([l, l + drag.w, drag.t, drag.b]);
      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX; drag.lastT = e.timeStamp;
    });
    const endDrag = e => {
      const d = drag; drag = null;
      if (!d || !d.moved) return;
      suppressClick = true;                             // swallow the click that follows a drag, nothing later
      setTimeout(() => { suppressClick = false; });
      const v = e.timeStamp - d.lastT > 80 ? 0 : d.v;   // a pause before release cancels the flick
      const [l, r] = current();
      const projected = (l + r) / 2 + v * GLIDE_MS;
      const centre = k => { const [a, b] = rect(k); return (a + b) / 2; };
      select(d.line.reduce((p, k) => (Math.abs(centre(k) - projected) < Math.abs(centre(p) - projected) ? k : p)));
    };
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);
    const placeRO = new ResizeObserver(place);   // options can move when the track, or anything beside them, changes size
    placeRO.observe(box);

    return {
      el: bar,
      matches: item => (!value() || q(valueSel, item).some(v => v.textContent.trim() === value())) && api.matches(item),
      label: () => fullName.get(value()) || value(), query, sync
    };
  }

  // Card motion: when a filter or page changes, every visible card answers, in grid order, 40ms apart:
  // - cards that appear scale up with a small bounce (94% to 102% to 100%) while fading in
  // - cards that stay but move glide to their new spot (stopping exactly on it), then bounce the same way
  // - cards that stay in the same spot bounce in place (100% to 102% to 100%), without fading
  // On phones (767px and below, Webflow's Mobile landscape and Mobile portrait) cards are full width and tall,
  // so the bounce is smaller (97% to 100.8%) and grows from the card's top edge, which never moves up into the bar.
  // data-filter-card-motion="off" on the bar turns it off. Only transform and opacity move, and reduced
  // motion turns it off too.
  const POP_MS = 520, STAGGER_MS = 40;
  const UP = 'cubic-bezier(.2,.8,.2,1)', SETTLE = 'cubic-bezier(.4,0,.2,1)';
  const phone = matchMedia('(max-width: 767px)');
  function animateCards(items, before) {
    const s = phone.matches ? { from: 0.97, peak: 1.008, origin: '50% 0' } : { from: 0.94, peak: 1.02, origin: '50% 50%' };
    const frame = (scale, extra) => ({ transform: `scale(${scale})`, transformOrigin: s.origin, ...extra });
    let n = 0;
    items.forEach(item => {
      if (item.hidden) return;
      const now = item.getBoundingClientRect(), was = before.get(item);
      const delay = Math.min(n++, 12) * STAGGER_MS;   // stops growing after 12 cards, so a long list doesn't drag
      if (!was) {
        item.animate([
          frame(s.from, { opacity: 0, easing: UP }),
          frame(s.peak, { opacity: 1, offset: 0.6, easing: SETTLE }),
          frame(1, { opacity: 1 }),
        ], { duration: POP_MS, delay, fill: 'backwards' });
        return;
      }
      const dx = was.left - now.left, dy = was.top - now.top;
      if (Math.abs(dx) + Math.abs(dy) >= 1) {
        // Glide without overshooting the spot (a long glide's overshoot ran into the bar on phones), then the same small bounce
        item.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(1)`, transformOrigin: s.origin, easing: UP },
          { transform: `translate(0px, 0px) scale(${s.peak})`, transformOrigin: s.origin, offset: 0.6, easing: SETTLE },
          { transform: 'translate(0px, 0px) scale(1)', transformOrigin: s.origin },
        ], { duration: POP_MS });
      } else {
        item.animate([
          frame(1, { easing: UP }),
          frame(s.peak, { offset: 0.6, easing: SETTLE }),
          frame(1),
        ], { duration: POP_MS, delay });
      }
    });
  }

  // Count and range wording: {name} is replaced with its value, and a part in [square brackets] shows only
  // when every {name} inside it has a value. The count's default is "{count} {noun}[ in {filter}][ matching “{search}”]"
  // and the range's is "Showing {from} to {to} of {total}". Change them per element with
  // data-filter-status-template and data-filter-range-template.
  function fillTemplate(template, values) {
    const has = key => values[key] !== undefined && values[key] !== '';
    return template
      .replace(/\[([^\]]*)\]/g, (_, part) => ([...part.matchAll(/\{(\w+)\}/g)].every(m => has(m[1])) ? part : ''))
      .replace(/\{(\w+)\}/g, (_, key) => (has(key) ? values[key] : ''))
      .replace(/\s+/g, ' ').trim();
  }

  // Filters every item in the group first, then shows one page of the matches (all of them without a
  // pager). A filter or search change goes back to page 1; keepPage stays on the current page.
  // animate is true for filter and page changes, so typing in search stays instant.
  const pageOf = new Map();   // group name -> current page, from 1
  function applyGroup(group, keepPage = false, animate = false) {
    const bars = groups.get(group) || [];
    const items = q(attr('data-filter-item', group));
    const motion = animate && !reduceMotion.matches && bars[0]?.el.dataset.filterCardMotion !== 'off';
    const before = new Map();   // where each visible card sat before the change
    if (motion) items.forEach(item => {
      item.getAnimations().forEach(a => a.cancel());   // a quick second click starts from where cards really are
      if (!item.hidden) before.set(item, item.getBoundingClientRect());
    });
    const matched = items.filter(item => bars.every(b => b.matches(item)));
    const pagers = q(attr('data-filter-pagination', group)).filter(p => p.filterPager);
    const size = num(pagers[0]?.dataset.filterPageSize, 0) || matched.length || 1;
    const count = Math.max(1, Math.ceil(matched.length / size));
    const page = Math.min(count, keepPage ? pageOf.get(group) || 1 : 1);
    pageOf.set(group, page);
    const start = (page - 1) * size, onPage = new Set(matched.slice(start, start + size));
    items.forEach(item => { item.hidden = !onPage.has(item); });

    const shown = matched.length;
    const filter = bars.map(b => b.label()).filter(Boolean).join(', '), search = bars.map(b => b.query()).filter(Boolean).join(' ');
    q(attr('data-filter-status', group)).forEach(el => {
      const one = el.dataset.filterNoun || 'item', many = el.dataset.filterNounPlural || `${one}s`;
      el.setAttribute('role', 'status');
      el.textContent = fillTemplate(el.dataset.filterStatusTemplate || '{count} {noun}[ in {filter}][ matching “{search}”]',
        { count: shown, noun: shown === 1 ? one : many, filter, search });
    });
    q(attr('data-filter-range', group)).forEach(el => {
      el.textContent = shown ? fillTemplate(el.dataset.filterRangeTemplate || 'Showing {from} to {to} of {total}',
        { from: start + 1, to: start + onPage.size, total: shown }) : '';
    });
    q(attr('data-filter-empty', group)).forEach(el => el.toggleAttribute('data-filter-show', shown === 0));
    pagers.forEach(p => renderPager(p, page, count));
    q('[data-fit-photo]').forEach(fit);   // cards just shown get their height now, not on the next frame
    if (motion) animateCards(items, before);
  }

  // Pagination (optional): [data-filter-pagination="group"] with data-filter-page-size. Inside it, any of:
  // [data-filter-prev], [data-filter-next], and a [data-filter-pages] wrapper holding one [data-filter-page]
  // template (plus an optional [data-filter-page-gap] for "..."). Current and disabled states get classes
  // you style in Webflow: is-current and is-disabled, or your own names via data-filter-current-class
  // and data-filter-disabled-class.
  function setupPager(pager) {
    const group = pager.dataset.filterPagination;
    const tpl = pager.querySelector('[data-filter-page]'), gap = pager.querySelector('[data-filter-page-gap]');
    tpl?.remove();
    gap?.remove();
    if (!pager.hasAttribute('aria-label')) pager.setAttribute('aria-label', 'Pages');
    pager.filterPager = { pages: pager.querySelector('[data-filter-pages]'), tpl, gap };
    if (!groups.has(group)) groups.set(group, []);
    pager.addEventListener('click', e => {
      const t = e.target.closest('[data-filter-prev], [data-filter-next], [data-filter-page]');
      if (!t) return;
      e.preventDefault();   // page controls built from Webflow Buttons are links
      if (t.getAttribute('aria-disabled') === 'true') return;
      const p = pageOf.get(group) || 1;
      pageOf.set(group, t.matches('[data-filter-prev]') ? p - 1 : t.matches('[data-filter-next]') ? p + 1 : +t.dataset.filterPageNumber);
      applyGroup(group, true, true);
      if (t.matches('[data-filter-page]')) pager.querySelector('[aria-current="page"]')?.focus();   // the old button was replaced
      // Bring the top of the list back into view when it has scrolled away
      const top = document.querySelector(attr('data-filter-bar', group)) || q(attr('data-filter-item', group)).find(i => !i.hidden);
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
  }
  function renderPager(pager, page, count) {
    const { pages, tpl, gap } = pager.filterPager;
    const current = pager.dataset.filterCurrentClass || 'is-current', disabled = pager.dataset.filterDisabledClass || 'is-disabled';
    pager.hidden = count < 2;
    [['[data-filter-prev]', page <= 1], ['[data-filter-next]', page >= count]].forEach(([sel, off]) => q(sel, pager).forEach(b => {
      b.setAttribute('aria-disabled', String(off));
      b.classList.toggle(disabled, off);
    }));
    if (!pages || !tpl) return;
    // With a gap template and more than 7 pages: first, last and the pages either side of the current one
    const compact = gap && count > 7, list = [];
    for (let n = 1; n <= count; n++) if (!compact || n === 1 || n === count || Math.abs(n - page) <= 1) list.push(n);
    const els = [];
    list.forEach((n, i) => {
      if (i && n - list[i - 1] > 1) els.push(gap.cloneNode(true));
      const b = tpl.cloneNode(true);
      (b.querySelector('[data-filter-page-label]') || b).textContent = n;
      b.dataset.filterPageNumber = n;
      b.setAttribute('aria-label', `Page ${n}`);
      b.classList.toggle(current, n === page);
      if (n === page) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      els.push(b);
    });
    pages.replaceChildren(...els);
  }

  // Equal card heights (optional): lines that wrap in [data-fit-text], or that the [data-fit-grow] area
  // adds past its [data-fit-base] line, come out of the [data-fit-photo] instead of making the card taller
  const fitOwner = new WeakMap();   // watched element -> its card's photo
  const cardOf = photo => photo.closest('[data-filter-item]') || photo.parentElement;
  const fit = photo => {
    const card = cardOf(photo);
    if (card.closest('[hidden]')) return;
    const grow = card.querySelector('[data-fit-grow]'), base = card.querySelector('[data-fit-base]');
    let extra = 0;
    if (grow && base) extra += grow.getBoundingClientRect().bottom - base.getBoundingClientRect().bottom - parseFloat(getComputedStyle(grow).paddingBottom) + wrapExtra(base);
    q('[data-fit-text]', card).forEach(el => { extra += wrapExtra(el); });
    photo.style.setProperty('--fit-extra', `${Math.max(0, extra)}px`);
  };
  const fitRO = new ResizeObserver(entries => entries.forEach(e => { const p = fitOwner.get(e.target); if (p) fit(p); }));
  const watchFit = () => q('[data-fit-photo]').forEach(photo => {
    q('[data-fit-grow], [data-fit-text]', cardOf(photo)).forEach(el => {
      if (!fitOwner.has(el)) { fitOwner.set(el, photo); fitRO.observe(el); }
    });
  });

  // Repeated values (optional): inside a [data-filter-unique] list, an item whose text matches an earlier one
  // is hidden, like a second "Bowling Green, KY" from two branches in the same city. Collection Items are the
  // items when the list has any; otherwise its direct children are. Capitals and extra spaces don't count.
  function hideRepeats() {
    q('[data-filter-unique]').forEach(list => {
      const dyn = q('.w-dyn-item', list);
      const seen = new Set();
      (dyn.length ? dyn : [...list.children]).forEach(el => {
        const key = el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
        el.toggleAttribute('data-filter-repeat', key !== '' && seen.has(key));
        seen.add(key);
      });
    });
  }

  // Start every bar on the page, then again whenever items land later (Finsweet List Load, CMS pagination)
  function refresh() {
    hideRepeats();   // before card heights are measured, so hidden repeats don't add a line
    q('[data-filter-bar]').forEach(bar => {
      if (bar.filterBar) return;
      bar.filterBar = createBar(bar);
      const g = bar.dataset.filterBar;
      groups.set(g, [...(groups.get(g) || []), bar.filterBar]);
    });
    q('[data-filter-pagination]').forEach(p => { if (!p.filterPager) setupPager(p); });
    groups.forEach((bars, g) => { bars.forEach(b => b.sync()); applyGroup(g, true); });
    watchFit();
  }
  let queued = false;
  const start = () => {
    refresh();
    new MutationObserver(records => {
      const added = records.some(r => [...r.addedNodes].some(n => n.nodeType === 1 &&
        (n.matches('[data-filter-item], [data-filter-bar], [data-fit-photo], [data-filter-unique]') || n.querySelector('[data-filter-item], [data-filter-bar], [data-fit-photo], [data-filter-unique]'))));
      if (!added || queued) return;
      queued = true;
      setTimeout(() => { queued = false; refresh(); });   // one refresh per batch of added items
    }).observe(document.body, { childList: true, subtree: true });
  };
  // A Code Embed can run before the bar and cards below it exist, so wait for the page to finish loading
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
