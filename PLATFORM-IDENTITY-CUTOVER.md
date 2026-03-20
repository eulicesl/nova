# N.O.V.A. Platform Identity Cutover

**Project:** N.O.V.A.
**Branch Intent:** `pr/nova-platform-identity-cutover`
**Status:** Ready for implementation
**Last Updated:** 2026-03-20
**Related:** `OWNERSHIP-MIGRATION.md`, `docs/micro-prds/04-release-identity-decisions.md`, `docs/validation/`

---

## 1. Purpose

This document defines the dedicated follow-up PR for the **runtime/platform identity migration** that was intentionally deferred from PR #5.

This is the risky PR.
Its job is to migrate ownership-sensitive runtime identifiers without mixing in broad docs, branding, or unrelated cleanup.

---

## 2. Scope

## In scope
- Expo slug decision and implementation
- app URL scheme migration strategy
- iOS bundle identifier migration
- Android package migration
- widget app-group migration
- live-activity / deeplink continuity handling
- validation notes for fresh install and upgrade expectations

## Out of scope
- README rewrites
- branding copy work
- unrelated refactors
- broad internal naming cleanup
- visual asset redesign

---

## 3. Owned target namespace

Approved owned namespace:
- `com.eulices.nova`

Target direction:
- iOS bundle identifier → `com.eulices.nova`
- Android package → `com.eulices.nova`
- widget app group → `group.com.eulices.nova`
- app scheme → `nova` (preferably additive before hard cutover)
- Expo slug → `nova` if tooling continuity is acceptable

---

## 4. Continuity posture

This PR should be treated as a **compatibility-first migration**.

### Preferred strategy
1. preserve old runtime assumptions where possible
2. add new identity paths where possible
3. validate install / upgrade / widget behavior
4. only then remove legacy behavior if clearly safe

### Risk reality
The most dangerous surfaces are:
- bundle identifier
- Android package name
- widget app-group identifier
- deeplink scheme behavior

These can affect install/update continuity, extension communication, and runtime routing.

---

## 5. Minimum implementation checklist

- [ ] verify current app.json / package.json / widget target state
- [ ] decide whether slug change belongs in same PR or separate PR
- [ ] implement owned identifiers under `com.eulices.nova`
- [ ] preserve or intentionally replace old deeplink behavior
- [ ] validate widget/live-activity path assumptions
- [ ] run lint
- [ ] capture fresh-install notes
- [ ] capture upgrade-risk notes
- [ ] document rollback plan in PR body

---

## 6. Validation requirements

Use the scaffold in `docs/validation/`.

Minimum proof set for merge confidence:
- fresh install branding + launch sanity
- route/deeplink sanity
- widget/live-activity sanity if available
- explicit statement on whether upgrade continuity was tested or remains a known risk

---

## 7. Merge standard

Do not merge this PR on aesthetics alone.

Merge only if:
- implementation is internally consistent
- lint passes
- runtime identity story is documented clearly
- rollback is straightforward enough to understand
- no unresolved high-risk review concerns remain

---

## 8. Recommended next move

Before changing code, inspect these exact files together:
- `app.json`
- `package.json`
- `lib/constants.ts`
- `targets/widget/expo-target.config.js`
- `targets/widget/generated.entitlements`
- `targets/widget/WidgetLiveActivity.swift`

Then implement the cutover as one focused PR with compatibility notes, not a sprawling rewrite.
