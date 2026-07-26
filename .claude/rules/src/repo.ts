# Rule: src/repo.ts

Scope: this rule governs all edits to `src/repo.ts`. When creating or
changing that file, follow every constraint below.

## Purpose

`src/repo.ts` provides the persistence layer for the transcript service. It
replaces the array-based storage (`_transcripts: Transcript[]`) currently held
inside `TranscriptService` with a repository backed by a `Map`.

## Design constraints

- Store transcripts in a `Map<StudentID, Transcript>` keyed by student ID.
  Do not use an array as the backing store; the whole point of this module is
  the `Map`-based lookup.
- Expose a single class (e.g. `TranscriptRepo`) as the storage abstraction.
  `TranscriptService` should own an instance of it and delegate storage to it,
  rather than manipulating a collection directly.
- Assign student IDs from a monotonically increasing counter, matching the
  existing `_lastID` behavior. IDs start at 1.
- Provide, at minimum, the operations `TranscriptService` needs:
  add a student, look up a transcript by ID, add a grade, and reset/clear.
- Import the shared types from `./types.ts` (`StudentID`, `Student`,
  `Transcript`, `Course`). Do not redefine them here.

## Error handling

- A lookup for a missing `StudentID` must `throw` (mirror the existing
  `Transcript not found for student with ID ${id}` message), so that
  `controller.ts` can keep returning `{ success: false }` on the caught error.
- Never return `undefined` from a lookup; either return the value or throw.

## Style (from the project style guide)

- 2-space indent, single quotes, no semicolons, max line length 100.
- `const` over `let`; avoid loops and mutable state where a `Map`/array method
  will do. The `Map` itself is the only mutable store.
- Private properties are prefixed with `_`.
- Types are `UpperCamelCase`; variables and methods are `lowerCamelCase`.
- Name methods for their result (nouns for value-returning methods, verbs for
  actions): e.g. `transcriptFor(id)`, `addStudent(name)`, `addGrade(...)`.
- Use JSDoc on the class and each public method.

## Out of scope

- Do not add persistence to disk, external databases, or configuration knobs
  that were not requested. Keep the implementation minimal.
- Do not change `types.ts`, `controller.ts`, or the API contract in
  `api.spec.ts`; this module must fit behind the existing behavior.
