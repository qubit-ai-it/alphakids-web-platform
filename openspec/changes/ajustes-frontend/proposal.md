# Proposal: Ajustes Frontend

## Intent

Clean up frontend UX inconsistencies across the platform: normalize Rioplatense voseo to neutral Spanish throughout landing and emails, add slug UX guardrails, remove deprecated parent self-registration, add audio recording to word forms, and deduplicate role label maps into a shared constant.

## Scope

### In Scope
- Convert voseo→tuteo in 8 files (landing content, email template, app page, dashboard page)
- Add `.transform(v => v.toLowerCase())` + helper text to InstitutionForm slug
- Remove `parent` from UserForm availableRoles + disable RegisterParentForm
- Add MediaRecorder-based audio recording (record→preview→submit) to WordForm
- Extract `ROLE_LABELS` into `shared/lib/roles.ts` — consume in 4 files

### Out of Scope
- CSV import (deferred — separate PR)
- Backend/API changes, auth guards, new routes
- Any spec-level behavior change beyond landing-page string content

## Capabilities

### New Capabilities
- `word-management`: audio recording via MediaRecorder in the teacher word form

### Modified Capabilities
- `landing-page`: R4 / FAQ / lead form text strings change from voseo to neutral Spanish

## Approach

5 independent mechanical tasks, all frontend-only (Next.js/React/TypeScript). Each is find-and-replace or additive — no cross-module coupling, no API changes, no new routes.

| # | Task | Files | Est. ± |
|---|------|-------|--------|
| 1 | Voseo→tuteo | 8 files | ~40 lines |
| 2 | Slug toLowerCase + helper | 1 file | ~10 lines |
| 3 | Remove parent creation | 3 files | ~50 lines |
| 4 | Audio recording in WordForm | 1 file | ~80 lines |
| 5 | Shared role labels | 5 files (1 new) | ~30 lines |

## Affected Areas

| Area | Impact |
|------|--------|
| `features/landing/data/content.ts` | Modified — 8 voseo→tuteo |
| `features/landing/components/HowItWorks.tsx` | Modified — "Empezá→Empieza" |
| `features/landing/components/FAQ.tsx` | Modified — "necesitás→necesitas" |
| `features/landing/components/LeadForm.tsx` | Modified — voseo + remove padre CTA |
| `features/landing/components/DemoVideo.tsx` | Modified — "Mirá→Mira" |
| `features/email/templates/SetupPasswordEmail.tsx` | Modified — "Hacé→Haz", "ignorá→ignora" |
| `app/page.tsx` | Modified — voseo toast + disable RegisterParentForm modal |
| `app/dashboard/director/docentes/page.tsx` | Modified — "Configurá→Configura" |
| `features/admin/components/InstitutionForm.tsx` | Modified — slug .transform + helper |
| `features/admin/components/UserForm.tsx` | Modified — remove 'parent' from roles |
| `features/auth/components/RegisterParentForm.tsx` | Modified — static message |
| `features/docente/components/WordForm.tsx` | Modified — add MediaRecorder |
| `shared/lib/roles.ts` | **New** — ROLE_LABELS export |
| `shared/components/ui/Badge.tsx` | Modified — import ROLE_LABELS |
| `app/dashboard/layout.tsx` | Modified — use ROLE_LABELS |
| `features/profile/components/ProfileForm.tsx` | Modified — use ROLE_LABELS |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed voseo instance | Low | `grep -i 'ás\|és\|í\|ó'` after changes |
| MediaRecorder browser compat | Low | Keep file upload as fallback |

## Rollback Plan

`git checkout .` — each task is independently revertible, no data migration.

## Dependencies

None. All 5 tasks are parallelizable.

## Success Criteria

- [ ] `pnpm build` passes cleanly
- [ ] No voseo forms remain in landing, email, or auth files
- [ ] Slug field auto-lowercases on input; helper text visible
- [ ] Parent role absent from UserForm; RegisterParentForm shows info message
- [ ] WordForm record→preview→submit cycle works (pulsing icon, duration)
- [ ] All 4 consumers use shared `ROLE_LABELS` — no duplicate maps
