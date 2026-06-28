# AI Investment Research Agent (InsideIIM × Altuni AI Labs)

This is the Obsidian Vault containing project planning, execution logs, agent details, and architecture diagrams.

## Obsidian Vault Layout
* [project_proposal.md](project_proposal.md) - Deep dive into multi-agent LangGraph workflow, custom parallel execution graph, and cinematic design parameters.
* [todo.md](todo.md) - The setup, backend, frontend, and verification checklist. All phases are 100% completed.
* [assignment_details.md](assignment_details.md) - The original assignment criteria sheet for Altuni AI Labs take-home.
* [AGENTS.md](AGENTS.md) - Internal developer spec sheet detailing each agent's goals and parameters.

---

## Technical Overview of Implemented Codebase

The code itself is located inside the [code/](file:///c:/Users/Meher%20Prakash/Documents/antigravity/jolly-turing/code) directory:

1. **Parallel Execution Graph:** Optimizes the pipeline by running **Analyst** and **Sentiment** agents in parallel using LangGraph.js, reducing execution runtime from ~40s to ~15s.
2. **Skeuomorphic & Claymorphic Dashboard:** Built with Vanilla CSS, featuring 3D inner highlights, specular glare reflections, and fully animated inflated clay agent indicator orbs.
3. **Make Report (Print & PDF):** Dynamic liquid glass modal providing a clean, print-optimized stylesheet (`@media print` overrides) to format the verdict summary as a clean black-and-white print sheet or PDF.
4. **Responsive Mobile Compatibility:** Seamless resize scaling for navigation headers, the orbital loader circle radius (scaled from `215px` to `115px`), card carousels, and report modals on smaller viewports.
5. **Design & AI Stack:** Integrates **Imagine** for custom graphical profiles, **Claude** for prompt engineering, **SkillUI** for physical component modeling, and **Google Flow** for interaction recommendations.
