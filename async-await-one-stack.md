# Adding `async`/`await`: tracing one call stack

To show that converting the app to the persistent (asynchronous) service is *not*
a big deal, we trace a single request — **`POST /api/addGrade`** — from the HTTP
layer all the way down to the repository. We pick `addGrade` because it is the
richest path: internally it does a read-modify-write (`getRecord` then `setData`).

## The call stack

| # | Layer | File | What changes |
|---|-------|------|--------------|
| 0 | HTTP client / Express route | `server.ts` | **nothing** |
| 1 | `withValidation` inner handler | `controller.ts` | add `async` + one `await` |
| 2 | `addGrade` responseFn | `controller.ts` | add `async` + one `await` |
| 3 | `service.addGrade` | `persistentTranscriptService.ts` | **already async** |
| 4 | `db.getRecord` + `db.setData` | `persistentRepo.ts` | **already async** (keyv is) |

Of the 5 levels, **two (3 and 4) are already done**, level 0 is untouched, and the
only *new* work is at levels 1 and 2 — the controller.

### Don't forget: the tests are callers too

The stack above is the *production* path. But any test that calls one of these
functions is also a caller, and the rule is the same — if a test awaits a result,
it needs `async`/`await`; if it doesn't, it needs nothing.

| Test file | Calls what | What changes |
|-----------|-----------|--------------|
| `api.spec.ts` | the HTTP endpoint via `supertest` | **nothing** — `supertest` was already awaited |
| `persistentTranscriptService.spec.ts` | `service.addGrade` **directly** | add `async` + `await`s |

This is why we could not simply reuse `transcript.service.spec.ts` (which tests the
synchronous service) and instead wrote `persistentTranscriptService.spec.ts`.

## What the two controller edits actually look like

**Level 2** — the `addGrade` handler. Two keywords:

```typescript
export const addGrade = withValidation(zAddGradeBody, async data => {   // + async
  try {
    await service.addGrade(data.studentID, data.courseName, data.courseGrade)  // + await
    return { status: 200, body: { success: true } }
  } catch {
    return { status: 200, body: { success: false } }
  }
})
```

**Level 1** — `withValidation` awaits whatever the handler returns. Two keywords:

```typescript
return async (req: Request, res: Response) => {           // + async
  const parsed = zodSchema.safeParse(req.body)
  const handlerResponse: HandlerResponse = !parsed.success
    ? { status: 400, body: { error: 'Poorly-formed request' } }
    : !checkPassword(parsed.data.password)
      ? { status: 403, body: { error: 'Invalid credentials' } }
      : await responseFn(parsed.data)                      // + await
  res.status(handlerResponse.status).send(handlerResponse.body)
}
```

## The same sample, on the test side

The service-level test for `addGrade` changes exactly the way the production caller
does — same shape, more `await`s:

```typescript
// synchronous (transcript.service.spec.ts)
it(`should add a grade`, () => {
  const id = service.addStudent("Carol")
  service.addGrade(id, "Math", 91)
  expect(service.getTranscript(id)).toStrictEqual(/* ... */)
})

// asynchronous (persistentTranscriptService.spec.ts)
it(`should add a grade`, async () => {                          // + async
  const id = await service.addStudent("Carol")                  // + await
  await service.addGrade(id, "Math", 91)                        // + await
  expect(await service.getTranscript(id)).toStrictEqual(/* ... */)  // + await
})
```

One idiom shift beyond the keywords: synchronous throw-checks
`expect(() => ...).toThrow()` become `await expect(...).rejects.toThrow()`.

## The point

Tracing the whole stack, the production change is **four keywords in one file** —
`async`/`await` twice each. Notably:

- The **shape** of every function is unchanged: same parameters, same branches,
  same return values. `await` just unwraps the `Promise`; it doesn't restructure
  anything.
- The change **stops propagating** the moment a caller doesn't use the return
  value. Level 1 already does `res.send(...)` at the end and doesn't `return` a
  value to Express, so Express (level 0) needs nothing — async "leaks up" only as
  far as someone `await`s a result.
- `withValidation` written once means the `async`/`await` is added in **one**
  helper, not repeated across all three endpoints. Good factoring localizes the
  change.

The honest caveat to acknowledge: `await` is only "free" because the ternary
already funnels through a single `responseFn(...)` call site. The reason it's four
keywords and not forty is that the code was already factored well — the async
change rewards good structure rather than being cheap unconditionally.

## The one rule that ties it all together

Don't think of this as "production code vs. test code." Every layer above — Express,
the controller, the service, both spec files — obeys a single rule:

> **Does this caller use the return value?**
> If it `await`s a result, it gets the two keywords. If it doesn't, it needs nothing.

That is why Express at the top needs nothing (level 1 ends in `res.send(...)` and
returns nothing to it), why `api.spec.ts` needs nothing (`supertest` was already
awaited), and why the controller and the service-level spec each pick up their
`async`/`await`. Same rule, applied uniformly, top to bottom.
