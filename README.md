# Math Visualizations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

An interactive single-page collection of mathematical objects — chaos theory, topology, and fractals — rendered in the browser with smooth tab transitions and no page reloads.

**[View Live](https://pklauv.github.io/Math-Visualizations/)**

## Visualizations

- **Lorenz Attractor** — The butterfly of chaos theory. Animated 3D trajectory with cinematic camera orbit, differential equations, and the story behind Lorenz's 1963 discovery.

- **Mobius Strip** — A surface with one side and one edge. Interactive 3D surface with adjustable half-twists and width, parametric equations, and connections to the Klein bottle.

- **Klein Bottle** — A closed surface with no inside or outside. Figure-8 immersion in 3D with adjustable opacity, auto-rotation, and topology explanations.

- **Sierpinski Triangle** — Infinite self-similarity from a simple rule. Recursive subdivision and chaos game methods, animated depth build-up, and fractal dimension.

- **Mandelbrot Set** — Infinite complexity from z squared plus c. Click-to-zoom explorer with adjustable iterations, multiple color schemes, and smooth coloring.

## Features

- **Single-page app** — All visualizations live on one page with tab switching, no page reloads
- **Hash routing** — Direct links like `index.html#lorenz` work, and browser back/forward navigates between tabs
- **Lazy initialization** — Visualizations only load when their tab is first opened
- **Pause/resume** — Switching away from a tab pauses its animation to save CPU; switching back resumes it
- **Mobile-friendly** — Responsive layout with horizontally scrollable tab bar on small screens
- **Educational content** — Each visualization includes equations (rendered with MathJax), parameter tables, and plain-language explanations

## Built With

- [Plotly.js](https://plotly.com/javascript/) — 3D surface and scatter plotting (Lorenz, Mobius, Klein)
- [MathJax](https://www.mathjax.org/) — LaTeX equation rendering
- HTML5 Canvas — 2D fractal rendering (Sierpinski, Mandelbrot)
- Vanilla HTML, CSS, and JavaScript — no build tools, no frameworks

## Project Structure

```
index.html                 — SPA shell with all tab panels
css/shared.css             — Shared styles, tab panel transitions, viz component classes
js/tab-controller.js       — Tab switching, hash routing, lazy init orchestration
js/viz-lorenz.js           — Lorenz attractor module
js/viz-mobius.js           — Mobius strip module
js/viz-klein.js            — Klein bottle module
js/viz-sierpinski.js       — Sierpinski triangle module
js/viz-mandelbrot.js       — Mandelbrot set module
visualizations/*.html      — Standalone pages (kept for backward compatibility)
```

## How It Has Improved

This project started as a simple Python primer repo and evolved into a full interactive math visualization portfolio over the course of development.

**Started as a Python project** — The initial commits set up a basic Python environment with a virtual environment and requirements file. The repo was originally scoped as a coding primer.

**First visualization: Lorenz Attractor** — The project shifted direction when a 3D Lorenz attractor was added using Plotly.js. Early iterations focused on getting the animation working, then optimizing frame rate performance, and adding educational content like equations and the history behind Lorenz's discovery.

**Expanded to a multi-page portfolio** — Four more visualizations were added — the Mobius strip, Klein bottle, Sierpinski triangle, and Mandelbrot set — each on its own HTML page with a shared navigation bar and consistent dark-theme design. The landing page used a card grid with programmatic canvas thumbnails.

**Mobile and cross-browser fixes** — The Klein bottle page went through several rounds of fixes to get it working properly on mobile devices, addressing layout and rendering issues.

**Consolidated into a single-page app** — The most recent major change replaced the multi-page architecture with a single-page tab-based design. Each visualization was extracted into its own JS module with an `init/pause/resume` interface. A tab controller handles hash routing, lazy initialization, and CSS fade transitions between panels. This eliminated page reloads, reduced redundant resource loading, and improved the overall user experience.

## License

This project is licensed under the [MIT License](./LICENSE).
