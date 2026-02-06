🥇 Phase 0 — Alignment (Before Any Code)
1️⃣ vision.md

When: Before project setup
Used for:

Defining scope

Deciding what NOT to build

Preventing feature creep

Development impact:

Determines MVP boundaries

Prevents rewriting later

📌 Revisit this whenever you’re tempted to add features.

🥈 Phase 1 — Architecture Foundation
2️⃣ architecture/app-architecture.md

When: Before creating folders or screens
Used for:

Folder structure

Layer separation

Naming conventions

Development impact:

Directly translates into src/ structure

Dictates how components, hooks, and storage interact

📌 This file guides your first commit.

3️⃣ architecture/navigation.md

When: Right after architecture decisions
Used for:

App flow

Screen hierarchy

Tab structure

Development impact:

Determines routing setup (Expo Router / React Navigation)

Prevents navigation refactors later

📌 Build navigation before building screens.

🥉 Phase 2 — Domain & Data Design
4️⃣ architecture/data-model.md

When: Before touching storage or state
Used for:

Entity definitions

Relationships

Data invariants

Development impact:

Types & interfaces

Storage schema

Serialization logic

📌 This file becomes your TypeScript contract.

🧱 Phase 3 — Core Feature Implementation (In Order)

Now features drive development.

5️⃣ features/workout-logging.md

When: First real feature
Used for:

Screen requirements

User interactions

Validation rules

Development impact:

First screens

First storage writes

First hooks

📌 Everything else depends on this.

6️⃣ features/history.md

When: After logging works
Used for:

Read-only data access

Editing workflows

List performance considerations

Development impact:

List rendering

Navigation between sessions

Delete/update logic

📌 This exposes data model flaws early (good thing).

7️⃣ features/progress-tracking.md

When: After stable data exists
Used for:

Derived data logic

Chart requirements

PR detection rules

Development impact:

Selector functions

Memoization

Visualization components

📌 This is where architecture either shines or breaks.

⚙️ Phase 4 — Quality & Hardening
8️⃣ non-functional.md

When: After core features exist
Used for:

Performance review

UX refinements

Edge case handling

Development impact:

Optimizing lists

Error handling

Dark mode polish

📌 This separates “it works” from “it’s good”.

🔮 Phase 5 — Expansion & Refactoring
9️⃣ future.md

When: Only after MVP is stable
Used for:

Roadmap planning

Refactor justification

Feature prioritization

Development impact:

Helps decide architecture changes

Prevents random feature additions

📌 This file protects your sanity.

🗺️ TL;DR – One-Line Execution Flow
vision
 → architecture
   → navigation
     → data-model
       → workout logging
         → history
           → progress tracking
             → non-functional
               → future


This is the natural dependency chain.

🧠 Pro Tip (Highly Recommended)

Add this line to each feature doc:

Dependencies:
Requires data-model.md v1.0 and workout-logging.md