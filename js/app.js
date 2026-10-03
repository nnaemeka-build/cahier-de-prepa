(function () {
  'use strict';

  const { t, setLang, getLang, TEMPLATES } = I18N;
  const KEY = 'cahier-de-prepa:tasks';
  const LANG_KEY = 'cahier-de-prepa:lang';
  const LINE = 32; // must match --line in css/style.css
  const $ = function (sel) { return document.querySelector(sel); };

  const filters = { category: 'all', status: 'all', query: '' };
  const formState = { category: 'prep', priority: 'medium' };
  let tasks = load();
  let renderTimer = null;

  /* ---------- storage ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? Tasks.parseImport(raw) : [];
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) { /* storage unavailable */ }
  }
  function update(next) { tasks = next; save(); render(); }

  /* ---------- helpers ---------- */
  function say(message) { $('#status').textContent = message; }

  function fillSelect(el, values, labelOf) {
    const current = el.value;
    el.innerHTML = '';
    values.forEach(function (v) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = labelOf(v);
      el.appendChild(o);
    });
    if (values.includes(current)) el.value = current;
  }

  /* A group of radio "chips". kindOf(value) returns 'plain' or 'hl-<category>'. */
  function buildChoice(host, name, values, labelOf, selected, onChange, kindOf) {
    host.innerHTML = '';
    values.forEach(function (v) {
      const label = document.createElement('label');
      label.className = 'chip ' + kindOf(v);
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = v;
      input.checked = v === selected;
      input.addEventListener('change', function () { onChange(v); });
      const span = document.createElement('span');
      span.textContent = labelOf(v);
      label.append(input, span);
      host.appendChild(label);
    });
  }

  function formatDate(iso) {
    const p = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(getLang(), { day: 'numeric', month: 'short' }).format(new Date(p[0], p[1] - 1, p[2]));
  }

  /* Keep the ruled lines of the page lined up with the task rows. */
  function alignGrid() {
    const list = $('#task-list');
    const offset = ((list.offsetTop % LINE) + LINE) % LINE;
    $('#sheet').style.setProperty('--gy', offset + 'px');
  }

  /* ---------- language ---------- */
  function applyLang() {
    const lang = getLang();
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $('#search').setAttribute('aria-label', t('searchPlaceholder'));
    $('#lang-toggle').textContent = lang === 'fr' ? 'EN' : 'FR';

    const now = new Date();
    const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    $('#school-year').textContent = t('schoolYear', { y: startYear + '\u2013' + (startYear + 1) });
    const today = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    $('#today').textContent = today.charAt(0).toUpperCase() + today.slice(1);

    const catLabel = function (c) { return t('category.' + c); };
    const catKind = function (c) { return c === 'all' ? 'plain' : 'hl-' + c; };
    const plain = function () { return 'plain'; };

    buildChoice($('#category-choice'), 'category', Tasks.CATEGORIES, catLabel,
      formState.category, function (v) { formState.category = v; }, catKind);
    buildChoice($('#priority-choice'), 'priority', Tasks.PRIORITIES,
      function (p) { return t('priority.' + p); },
      formState.priority, function (v) { formState.priority = v; }, plain);
    buildChoice($('#filter-category-choice'), 'filter-category', ['all'].concat(Tasks.CATEGORIES),
      function (c) { return c === 'all' ? t('allCategories') : catLabel(c); },
      filters.category, function (v) { filters.category = v; render(); }, catKind);
    buildChoice($('#filter-status-choice'), 'filter-status', ['all', 'open', 'done'],
      function (s) { return t('status' + s[0].toUpperCase() + s.slice(1)); },
      filters.status, function (v) { filters.status = v; render(); }, plain);

    fillSelect($('#template-select'), Object.keys(TEMPLATES), function (k) { return TEMPLATES[k][lang]; });
    render();
  }

  /* ---------- rendering ---------- */
  function renderScore() {
    const p = Tasks.progress(tasks);
    $('#score-text').textContent = p.total ? p.done + '/' + p.total : '\u2013';
    $('#score').setAttribute('aria-label', p.total ? t('progress', { done: p.done, total: p.total }) : t('progressEmpty'));
    const remark = p.total === 0 ? 'remarkEmpty' : p.percent === 100 ? 'remarkDone' : p.percent >= 50 ? 'remarkMid' : 'remarkLow';
    $('#remark').textContent = t(remark);
  }

  function taskItem(task) {
    const li = document.createElement('li');
    li.className = 'task priority-' + task.priority + (task.done ? ' done' : '');

    const check = document.createElement('span');
    check.className = 'check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.id = 'task-' + task.id;
    box.checked = task.done;
    check.appendChild(box);
    check.insertAdjacentHTML('beforeend',
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path pathLength="30" d="M7 17 L13 23 L28 5"/></svg>');
    box.addEventListener('change', function () {
      // Let the red tick finish drawing, then re-sort the list.
      tasks = Tasks.toggleTask(tasks, task.id);
      save();
      li.classList.toggle('done', box.checked);
      renderScore();
      clearTimeout(renderTimer);
      renderTimer = setTimeout(render, 380);
    });

    const body = document.createElement('div');
    body.className = 'task-body';

    const title = document.createElement('label');
    title.htmlFor = box.id;
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('p');
    meta.className = 'meta';

    const prio = document.createElement('span');
    prio.className = 'sr';
    prio.textContent = t('priorityLabel') + ' : ' + t('priority.' + task.priority);
    meta.appendChild(prio);

    const tag = document.createElement('span');
    tag.className = 'tag tag-' + task.category;
    tag.textContent = t('category.' + task.category);
    meta.appendChild(tag);

    if (task.due) {
      const due = document.createElement('span');
      const late = Tasks.isOverdue(task);
      due.textContent = (late ? t('overdue') + ' : ' : '') + formatDate(task.due);
      if (late) due.className = 'late';
      meta.appendChild(due);
    }

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove';
    del.textContent = '\u00d7';
    del.setAttribute('aria-label', t('remove') + ' : ' + task.title);
    del.addEventListener('click', function () { update(Tasks.removeTask(tasks, task.id)); });

    body.append(title, meta);
    li.append(check, body, del);
    return li;
  }

  function render() {
    clearTimeout(renderTimer);
    const list = $('#task-list');
    const visible = Tasks.sortTasks(Tasks.filterTasks(tasks, filters));
    list.innerHTML = '';
    visible.forEach(function (task) { list.appendChild(taskItem(task)); });

    const empty = $('#empty');
    empty.hidden = visible.length > 0;
    empty.textContent = t('empty');

    renderScore();
    alignGrid();
  }

  /* ---------- events ---------- */
  $('#task-form').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      const task = Tasks.createTask({
        title: $('#title').value,
        category: formState.category,
        priority: formState.priority,
        due: $('#due').value || null
      });
      update(tasks.concat(task));
      $('#title').value = '';
      $('#due').value = '';
      $('#title').focus();
      say(t('saved'));
    } catch (err) { say(err.message); }
  });

  $('#search').addEventListener('input', function (e) { filters.query = e.target.value; render(); });

  $('#lang-toggle').addEventListener('click', function () {
    const next = getLang() === 'fr' ? 'en' : 'fr';
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
    applyLang();
  });

  $('#template-add').addEventListener('click', function () {
    const tpl = TEMPLATES[$('#template-select').value];
    const lang = getLang();
    const added = tpl.tasks.map(function (item) {
      return Tasks.createTask({ title: item[lang], category: item.category, priority: item.priority });
    });
    update(tasks.concat(added));
    say(t('templateAdded', { n: added.length }));
  });

  $('#clear-done').addEventListener('click', function () { update(Tasks.clearDone(tasks)); });

  $('#export').addEventListener('click', function () {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cahier-de-prepa-' + Tasks.toISODate(new Date()) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#import').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(function (text) {
      const incoming = Tasks.parseImport(text);
      update(Tasks.mergeTasks(tasks, incoming));
      say(t('imported', { n: incoming.length }));
    }).catch(function () { say(t('importError')); });
    e.target.value = '';
  });

  window.addEventListener('resize', alignGrid);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(alignGrid);
    ['.top', '#task-form', '.filters'].forEach(function (sel) { ro.observe($(sel)); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignGrid);

  /* ---------- start ---------- */
  try { setLang(localStorage.getItem(LANG_KEY) || 'fr'); } catch (e) { setLang('fr'); }
  applyLang();
})();
