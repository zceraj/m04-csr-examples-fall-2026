---
name: async-failure-via-rejection
description: For async interfaces, the natural failure mode is a rejected promise (async analogue of throw)
metadata:
  type: feedback
---

For an async interface, the natural way to signal failure is to **reject the
promise** — it is the async analogue of `throw` on a synchronous interface.

**Why:** The user raised this while reviewing `IPersistentDB` (the Promise-based
analogue of `ISimpleDB`). A rejected promise is the idiomatic channel for
errors/violated preconditions in async code.

**How to apply:**
- Reject for genuine errors / violated preconditions (e.g. `setData(id, ...)` on
  a non-existent ID). This mirrors the sync version, which `throw`s.
- Resolve — possibly with `undefined` — for expected outcomes including absence
  (e.g. `getRecord(id)` on a missing ID resolves `undefined`, does NOT reject).
- Caveat for a real backend: the rejected channel will also carry
  infrastructure failures (store down, network). If callers must distinguish
  logical vs infrastructure failures, use typed error classes or a Result-style
  resolved value. Not needed for this course app.
