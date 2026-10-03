/* Tiny FR/EN dictionary. Add a language by adding a block to STRINGS. */
(function (root) {
  'use strict';

  const STRINGS = {
    fr: {
      appTitle: 'Cahier de prépa',
      titleLabel: 'Nouvelle tâche',
      titlePlaceholder: 'Ex. : corriger les dictées de la 6e B',
      categoryLabel: 'Catégorie',
      priorityLabel: 'Priorité',
      dueLabel: 'Pour le',
      add: 'Ajouter la tâche',
      searchPlaceholder: 'Rechercher une tâche',
      allCategories: 'Toutes catégories',
      statusLabel: 'Statut',
      schoolYear: 'Année scolaire {y}',
      remarkEmpty: 'Page blanche !',
      remarkLow: 'Courage !',
      remarkMid: 'Bien, continuez',
      remarkDone: 'Bravo !',
      statusAll: 'Tout',
      statusOpen: 'À faire',
      statusDone: 'Terminées',
      'category.prep': 'Préparation',
      'category.grading': 'Corrections',
      'category.admin': 'Administratif',
      'category.communication': 'Familles et collègues',
      'priority.low': 'Basse',
      'priority.medium': 'Normale',
      'priority.high': 'Haute',
      overdue: 'En retard',
      remove: 'Supprimer',
      progress: '{done} sur {total} terminées',
      progressEmpty: 'Aucune tâche pour le moment',
      empty: 'Rien à afficher. Ajoutez une tâche ou chargez un modèle ci-dessous.',
      addTemplate: 'Ajouter le modèle',
      clearDone: 'Retirer les terminées',
      export: 'Exporter',
      import: 'Importer',
      imported: '{n} tâche(s) importée(s).',
      importError: 'Fichier illisible : choisissez un export JSON de ce cahier.',
      templateAdded: '{n} tâches ajoutées.',
      saved: 'Tâche ajoutée.'
    },
    en: {
      appTitle: 'Prep Notebook',
      titleLabel: 'New task',
      titlePlaceholder: 'e.g. grade the Year 7 dictations',
      categoryLabel: 'Category',
      priorityLabel: 'Priority',
      dueLabel: 'Due',
      add: 'Add task',
      searchPlaceholder: 'Search tasks',
      allCategories: 'All categories',
      statusLabel: 'Status',
      schoolYear: 'School year {y}',
      remarkEmpty: 'Blank page!',
      remarkLow: 'Hang in there!',
      remarkMid: 'Good, keep going',
      remarkDone: 'Well done!',
      statusAll: 'All',
      statusOpen: 'To do',
      statusDone: 'Done',
      'category.prep': 'Lesson prep',
      'category.grading': 'Grading',
      'category.admin': 'Admin',
      'category.communication': 'Parents and colleagues',
      'priority.low': 'Low',
      'priority.medium': 'Normal',
      'priority.high': 'High',
      overdue: 'Overdue',
      remove: 'Delete',
      progress: '{done} of {total} done',
      progressEmpty: 'No tasks yet',
      empty: 'Nothing to show. Add a task or load a template below.',
      addTemplate: 'Add template',
      clearDone: 'Clear completed',
      export: 'Export',
      import: 'Import',
      imported: '{n} task(s) imported.',
      importError: 'Could not read that file: choose a JSON export from this notebook.',
      templateAdded: '{n} tasks added.',
      saved: 'Task added.'
    }
  };

  const TEMPLATES = {
    weekly: {
      fr: 'Routine de la semaine',
      en: 'Weekly routine',
      tasks: [
        { category: 'prep', priority: 'high', fr: 'Préparer les séances de la semaine prochaine', en: "Prepare next week's lessons" },
        { category: 'prep', priority: 'medium', fr: 'Imprimer et photocopier les supports', en: 'Print and copy handouts' },
        { category: 'grading', priority: 'high', fr: 'Corriger les copies en attente', en: 'Grade pending assignments' },
        { category: 'admin', priority: 'medium', fr: 'Mettre à jour le suivi des absences', en: 'Update the attendance record' },
        { category: 'communication', priority: 'low', fr: 'Répondre aux messages des familles', en: "Reply to parents' messages" }
      ]
    },
    endOfTerm: {
      fr: 'Fin de période',
      en: 'End of term',
      tasks: [
        { category: 'grading', priority: 'high', fr: 'Finaliser et saisir les notes', en: 'Finalise and enter grades' },
        { category: 'admin', priority: 'high', fr: 'Rédiger les appréciations des bulletins', en: 'Write report card comments' },
        { category: 'communication', priority: 'medium', fr: 'Préparer le conseil de classe', en: 'Prepare for the class council' },
        { category: 'prep', priority: 'low', fr: 'Faire le bilan de la progression pédagogique', en: 'Review progress against the syllabus' }
      ]
    }
  };

  let lang = 'fr';

  function setLang(next) { if (STRINGS[next]) lang = next; }
  function getLang() { return lang; }

  function t(key, vars) {
    let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  root.I18N = { t: t, setLang: setLang, getLang: getLang, TEMPLATES: TEMPLATES, LANGS: Object.keys(STRINGS) };
})(self);
