/* Pure task logic: no DOM, easy to test (see tests/tasks.test.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Tasks = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CATEGORIES = ['prep', 'grading', 'admin', 'communication'];
  const PRIORITIES = ['low', 'medium', 'high'];
  const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function newId(now) {
    return now.toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function createTask(input, now) {
    now = now === undefined ? Date.now() : now;
    const title = String((input && input.title) || '').trim();
    const category = (input && input.category) || 'prep';
    const priority = (input && input.priority) || 'medium';
    const due = (input && input.due) || null;

    if (!title) throw new Error('Title is required');
    if (!CATEGORIES.includes(category)) throw new Error('Invalid category');
    if (!PRIORITIES.includes(priority)) throw new Error('Invalid priority');
    if (due !== null && !ISO_DATE.test(due)) throw new Error('Invalid due date');

    return { id: newId(now), title, category, priority, due, done: false, createdAt: now };
  }

  function toggleTask(tasks, id) {
    return tasks.map(function (t) { return t.id === id ? Object.assign({}, t, { done: !t.done }) : t; });
  }

  function removeTask(tasks, id) {
    return tasks.filter(function (t) { return t.id !== id; });
  }

  function clearDone(tasks) {
    return tasks.filter(function (t) { return !t.done; });
  }

  function filterTasks(tasks, opts) {
    const o = Object.assign({ category: 'all', status: 'all', query: '' }, opts);
    const q = o.query.trim().toLowerCase();
    return tasks.filter(function (t) {
      if (o.category !== 'all' && t.category !== o.category) return false;
      if (o.status === 'open' && t.done) return false;
      if (o.status === 'done' && !t.done) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  /* Open tasks first, then earliest due date (undated last), then priority, then oldest. */
  function sortTasks(tasks) {
    return tasks.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due !== b.due) {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due < b.due ? -1 : 1;
      }
      if (a.priority !== b.priority) return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      return a.createdAt - b.createdAt;
    });
  }

  function progress(tasks) {
    const total = tasks.length;
    const done = tasks.filter(function (t) { return t.done; }).length;
    return { total: total, done: done, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function isOverdue(task, today) {
    if (!task.due || task.done) return false;
    return task.due < toISODate(today || new Date());
  }

  /* Validates and normalises a JSON export. Throws if the file is not a task list. */
  function parseImport(json) {
    let data;
    try { data = typeof json === 'string' ? JSON.parse(json) : json; }
    catch (e) { throw new Error('Invalid JSON'); }
    if (!Array.isArray(data)) throw new Error('Expected a list of tasks');

    const now = Date.now();
    return data
      .filter(function (t) { return t && typeof t.title === 'string' && t.title.trim(); })
      .map(function (t) {
        return {
          id: typeof t.id === 'string' && t.id ? t.id : newId(now),
          title: t.title.trim().slice(0, 140),
          category: CATEGORIES.includes(t.category) ? t.category : 'prep',
          priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
          due: typeof t.due === 'string' && ISO_DATE.test(t.due) ? t.due : null,
          done: t.done === true,
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : now
        };
      });
  }

  function mergeTasks(existing, incoming) {
    const ids = new Set(existing.map(function (t) { return t.id; }));
    return existing.concat(incoming.filter(function (t) { return !ids.has(t.id); }));
  }

  return {
    CATEGORIES: CATEGORIES, PRIORITIES: PRIORITIES,
    createTask: createTask, toggleTask: toggleTask, removeTask: removeTask, clearDone: clearDone,
    filterTasks: filterTasks, sortTasks: sortTasks, progress: progress, isOverdue: isOverdue,
    parseImport: parseImport, mergeTasks: mergeTasks, toISODate: toISODate
  };
});
