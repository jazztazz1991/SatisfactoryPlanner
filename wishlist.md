# SatisfactoryPlanner — Wishlist

## Gameplay Integration

- [ ] **Resource map integration**
  - Let users select which resource nodes they have access to (pure/normal/impure)
  - Constrain the solver to only produce what those nodes can supply
  - Show "you need 3 normal iron nodes" instead of just "270 iron ore/min"

- [ ] **Power grid planning**
  - Track total power consumption across the factory
  - Suggest how many coal/fuel/nuclear generators are needed
  - Warn when approaching grid limits

- [ ] **Milestone/MAM unlock tracking**
  - Let users mark which milestones and MAM research they've completed
  - Solver and recipe picker filter to only show unlocked options

- [ ] **Logistics planning**
  - Calculate belt tier requirements per connection (Mk.1–Mk.5)
  - Flag connections that exceed the selected tier's throughput
  - Suggest where to split lines

---

## Multi-Plan / Big Picture

- [ ] **World planner**
  - A meta-view connecting multiple factory plans
  - Output of Factory A feeds input of Factory B
  - Track global resource usage across all plans

- [ ] **Import/export between plans**
  - Mark certain items as "imported" (supplied externally) so they don't generate production chains

- [ ] **Plan versioning / history**
  - Save snapshots so users can compare "before I added Computers" vs "after"

---

## Quality of Life

- [ ] **Cost summary**
  - Total building costs to construct the factory
  - How many concrete, steel beams, etc. needed for foundations/walls/machines

- [ ] **Shopping list export**
  - Copy/paste or download a list of "build X assemblers, Y constructors, Z foundations"

- [ ] **Share as image / PDF**
  - Export the graph or factory view as an image for sharing on Reddit/Discord

- [ ] **Comparison mode**
  - Compare two plans side-by-side (e.g., "default recipes vs all alternates" to see efficiency gains)

- [ ] **Dark/light theme toggle**
  - Currently hardcoded dark theme only

---

## Community

- [ ] **Public plan gallery**
  - Let users publish plans for others to browse and clone
  - E.g., "efficient Turbo Motor factory"

- [ ] **Plan templates beyond Space Elevator**
  - Community-submitted or curated templates for common builds
  - Computer factory, modular frame hub, etc.

- [ ] **Comments on plans**
  - Collaborators can leave notes/annotations on specific nodes

---

## Advanced Solver

- [ ] **Optimization modes**
  - Minimize raw resources, minimize power, minimize machine count, or minimize floor space
  - Ties into the multi-floor factory feature

- [ ] **Underclocking/overclocking support**
  - Let users set clock speed per machine and recalculate power draw
  - Domain logic for `powerAtOverclock` already exists but isn't exposed in UI/API

- [ ] **Weighted resource preferences**
  - "I have more iron than copper, prefer iron-heavy recipes"

---

## Game Integration (LAST — do everything else first)

- [ ] **Save file import**
  - Let users upload their Satisfactory save file to the web app
  - Parse it to extract: available resource nodes, existing buildings, unlocked milestones/MAM research
  - Auto-populate resource map with the player's actual node locations and purities
  - Show what's already built vs. what still needs to be constructed
  - No mod required — pure web tech using community save file parsers
  - Read-only (can't push changes back to the game), user uploads manually
