# SatisfactoryPlanner — TODO

## Phase 1: Fix What's Broken

- [x] **P0 — Collaborators get 404 on plan page**
  - Fixed: `page.tsx` now uses `resolveAccessRole` + `getCollaboratorByPlanAndUser` instead of owner-only check

- [x] **P0 — ShareDialog infinite fetch loop**
  - Fixed: moved `loadCollaborators()` from render body to `useEffect` with `isOpen` dependency

- [x] **P1 — Collaborator DELETE/PATCH doesn't verify collabId belongs to planId**
  - Fixed: added `getCollaboratorById` lookup + `planId` match check before PATCH/DELETE

---

## Phase 2: Make Collaboration Work

- [ ] **P1 — Socket.IO has zero authentication**
  - `src/lib/socketServer.ts` / `src/lib/socketClient.ts`
  - Any client can connect and emit events to any plan room without verifying identity
  - Pass auth tokens during the socket handshake and verify server-side

- [ ] **P2 — No "Shared with me" section on dashboard**
  - Dashboard only queries owned plans (`getPlansByUser`)
  - Add a section showing plans where the user is a collaborator
  - `planRepository.ts` already has `getAllPlansForUser` with a raw SQL join — wire it up

- [x] **P2 — No pending invites view**
  - Fixed: added NotificationBell component in app header with invite accept/decline
  - API: GET/POST `/api/notifications` for pending invites + recent shares
  - Pending email invites matched by user email, accepted via `acceptCollaborator`

- [ ] **P2 — NodeInspector is read-only**
  - Has `onUpdate`/`onDelete` props but they're never wired up in `PlannerShell`
  - Users can't edit or delete nodes from the inspector panel

---

## Phase 3: Core Feature Completeness

- [ ] **P2 — RecipePicker has no effect**
  - Selecting a recipe in the sidebar doesn't do anything
  - Need an alternate recipe override mechanism in the solver

- [ ] **P2 — Solver doesn't handle cyclic recipes**
  - `CycleDetectedError` is defined in types but never thrown
  - Recipes like Recycled Rubber ↔ Recycled Plastic produce wrong numbers
  - BFS approach avoids infinite recursion but silently gives bad results

- [ ] **P2 — Solver always picks the first recipe**
  - No alternate recipe selection logic
  - Users should be able to choose which recipe to use per product

- [ ] **P2 — Excess item sinking in production chains**
  - Solver should detect byproducts/overproduction and automatically insert Awesome Sink nodes
  - Show sink points earned per minute from excess items
  - Allow users to toggle sinking per item (some excess may be wanted for other plans)

- [ ] **P2 — Multi-floor factory layout with configurable floor size**
  - Let users define a floor footprint (e.g. 8x4 foundations, 16x8, custom)
  - Factory layout engine distributes buildings across multiple floors when they don't fit on one
  - Each floor shown as a separate layer in the Factory view (tab per floor or stacked view)
  - Vertical conveyors / lifts between floors for items that cross floor boundaries
  - Floor count determined automatically based on total building footprint vs floor area

- [ ] **P2 — No user profile/settings page**
  - `PATCH /api/users/me` route exists but no UI
  - Add a settings page for name, email, password changes

- [ ] **P2 — No password reset / forgot password flow**
  - No way to recover access if password is forgotten
  - Requires email service integration

---

## Phase 4: UX & Polish

- [ ] **P3 — No toast/notification system**
  - Success/error feedback is inconsistent
  - Some places show inline errors, some swallow errors silently
  - Add a global toast system

- [ ] **P3 — No undo/redo**
  - No undo/redo for target or canvas changes
  - Add an undo/redo stack to the Zustand store

- [ ] **P3 — No dirty-state tracking / unsaved changes warning**
  - Browser refresh loses all unsaved state silently

- [ ] **P3 — No loading skeletons**
  - Only a `Spinner` component, no shimmer/skeleton UI

- [ ] **P3 — No mobile/responsive layout**
  - Canvas areas use hardcoded dimensions
  - Site is unusable on mobile

- [ ] **P3 — No graceful server shutdown**
  - `server.ts` has no `SIGTERM`/`SIGINT` handlers
  - Deploys drop active socket connections and DB connections

---

## Phase 5: Test Coverage

- [ ] **P3 — Zero RTL component tests**
  - Violates project RTL rule
  - Priority components: ShareDialog, PlanCard, NodeInspector, RecipePicker

- [ ] **P3 — No API route integration tests**

- [ ] **P3 — Missing E2E tests**
  - Target CRUD (add, edit, delete)
  - Plan deletion
  - Collaborator workflows (invite → accept → collaborate)
  - Tier picker interaction
  - Error states (500s, network failures, validation errors)

- [ ] **P3 — auth.setup.ts hardcodes localhost:3000**
  - Should use Playwright's `baseURL` instead

---

## Minor / Low Priority

- [ ] Game data APIs are public (no auth) — may be intentional for reference data
- [ ] No pagination on plan list API
- [ ] No plan duplication/clone feature
- [ ] No breadcrumb navigation
- [ ] No pre-commit hooks (husky/lint-staged)
- [ ] No CI/CD pipeline (only render.yaml)
- [ ] `next-auth@5.0.0-beta.30` — beta dependency in production
- [ ] No `engines` field in package.json
- [ ] No `typecheck` script (`tsc --noEmit`)
