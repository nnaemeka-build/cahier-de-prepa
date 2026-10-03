# Cahier de prépa

A tiny to-do notebook for teachers. Track lesson prep, grading, admin and parent communication in one place. It runs in the browser, works offline, and keeps your data on your own device.

Un petit cahier de tâches pour les enseignants : préparation, corrections, administratif et échanges avec les familles. Il fonctionne dans le navigateur, hors ligne, et vos données restent sur votre appareil.

## Features

- A notebook page that looks the part: Seyès grid, red margin, spiral binding, a cover label with the school year and today's date
- Tasks are written on the ruled lines, and ticking one draws a red-pen tick
- Your progress is "graded" in a circled red score, with a teacher's remark that changes as you go
- Four categories made for teaching, shown as highlighter swipes: lesson prep, grading, admin, parents and colleagues
- Priority, optional due dates, overdue flags, and urgent tasks marked `!!` in the margin
- Filter by category or status, and search by text
- Ready-made templates: **Weekly routine** and **End of term** (report card comments, class council)
- French and English interface, switchable in one click
- Export and import your tasks as JSON, to back up or move between devices
- Light and dark mode, printable, keyboard accessible
- No framework, no build step, no dependencies. Fonts (Andika and Caveat) load from Google Fonts, and the app falls back to system fonts when offline

## Quick start

No install needed. Open `index.html` in your browser.

Or serve it locally:

```bash
npm start
# then open http://localhost:8080
```

## Run the tests

Requires Node.js 18 or newer. No packages to install.

```bash
npm test
```

## Publish it with GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute, your app is live at `https://nnaemeka-build.github.io/cahier-de-prepa/`.

## Project structure

```
index.html        Page markup
css/style.css     Notebook-page styling (light and dark)
js/tasks.js       Task logic: pure functions, no DOM, fully tested
js/i18n.js        French and English strings, plus the templates
js/app.js         Wires the logic to the page
tests/            Unit tests (node:test)
.github/          Continuous integration (runs the tests on every push)
```

## Ideas for contributions

- Add a template for your own subject or school level
- Add a new language in `js/i18n.js`
- Recurring tasks (every Friday, every term)
- A weekly view grouped by day
- Installable offline app (service worker and manifest)

## Contributing

Issues and pull requests are welcome. Please run `npm test` before opening a pull request, and add a test when you change anything in `js/tasks.js`.

## License

[MIT](LICENSE)
