(function () {
  'use strict';

  const { t, setLang, getLang, TEMPLATES } = I18N;
  const KEY = 'cahier-de-prepa:tasks';
  const LANG_KEY = 'cahier-de-prepa:lang';
  const $ = function (sel) { return document.querySelector(sel); };

  const filters = { category: 'all', status: 'all', query: '' };
  let tasks = load();

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

  function formatDate(iso) {
    const p = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(getLang(), { day: 'numeric', month: 'short' }).format(new Date(p[0], p[1] - 1, p[2]));
  }

  /* ---------- language ---------- */
  function applyLang() {
    document.documentElement.lang = getLang();
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $('#lang-toggle').textContent = getLang() === 'fr' ? 'EN' : 'FR';

    const cat = function (c) { return t('category.' + c); };
    fillSelect($('#category'), Tasks.CATEGORIES, cat);
    fillSelect($('#priority'), Tasks.PRIORITIES, function (p) { return t('priority.' + p); });
    fillSelect($('#filter-category'), ['all'].concat(Tasks.CATEGORIES), function (c) { return c === 'all' ? t('allCategories') : cat(c); });
    fillSelect($('#filter-status'), ['all', 'open', 'done'], function (s) { return t('status' + s[0].toUpperCase() + s.slice(1)); });
    fillSelect($('#template-select'), Object.keys(TEMPLATES), function (k) { return TEMPLATES[k][getLang()]; });
    if (!$('#priority').dataset.touched) $('#priority').value = 'medium';
    render();
  }

  /* ---------- rendering ---------- */
  function taskItem(task) {
    const li = document.createElement('li');
    li.className = 'task priority-' + task.priority + (task.done ? ' done' : '');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.id = 'task-' + task.id;
    box.checked = task.done;
    box.addEventListener('change', function () { update(Tasks.toggleTask(tasks, task.id)); });

    const body = document.createElement('div');
    body.className = 'task-body';

    const title = document.createElement('label');
    title.htmlFor = box.id;
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('p');
    meta.className = 'meta';
    [t('category.' + task.category), t('priority.' + task.priority)].forEach(function (text) {
      const s = document.createElement('span');
      s.textContent = text;
      meta.appendChild(s);
    });
    if (task.due) {
      const s = document.createElement('span');
      const late = Tasks.isOverdue(task);
      s.textContent = (late ? t('overdue') + ' : ' : '') + formatDate(task.due);
      if (late) s.className = 'late';
      meta.appendChild(s);
    }

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove';
    del.textContent = '×';
    del.setAttribute('aria-label', t('remove') + ' : ' + task.title);
    del.addEventListener('click', function () { update(Tasks.removeTask(tasks, task.id)); });

    body.append(title, meta);
    li.append(box, body, del);
    return li;
  }

  function render() {
    const list = $('#task-list');
    const visible = Tasks.sortTasks(Tasks.filterTasks(tasks, filters));
    list.innerHTML = '';
    visible.forEach(function (task) { list.appendChild(taskItem(task)); });

    const empty = $('#empty');
    empty.hidden = visible.length > 0;
    empty.textContent = t('empty');

    const p = Tasks.progress(tasks);
    $('#bar-fill').style.width = p.percent + '%';
    $('#progress-text').textContent = p.total ? t('progress', { done: p.done, total: p.total }) : t('progressEmpty');
  }

  /* ---------- events ---------- */
  $('#task-form').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      const task = Tasks.createTask({
        title: $('#title').value,
        category: $('#category').value,
        priority: $('#priority').value,
        due: $('#due').value || null
      });
      update(tasks.concat(task));
      $('#title').value = '';
      $('#due').value = '';
      $('#title').focus();
      say(t('saved'));
    } catch (err) { say(err.message); }
  });

  $('#priority').addEventListener('change', function (e) { e.target.dataset.touched = '1'; });
  $('#filter-category').addEventListener('change', function (e) { filters.category = e.target.value; render(); });
  $('#filter-status').addEventListener('change', function (e) { filters.status = e.target.value; render(); });
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

  /* ---------- start ---------- */
  try { setLang(localStorage.getItem(LANG_KEY) || 'fr'); } catch (e) { setLang('fr'); }
  applyLang();
})();
