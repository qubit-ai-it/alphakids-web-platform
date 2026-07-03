# Tasks: Ajustes Frontend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | 5 PRs (one per task) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Voseo → Neutral Spanish | PR 1 | 8 files, pure text replacement, ~40 lines |
| 2 | Slug toLowerCase + Helper | PR 2 | 1 file, Zod reorder + JSX, ~16 lines |
| 3 | Eliminate Parent Creation | PR 3 | 4 files, RegisterParentForm replaced entirely, ~230 lines |
| 4 | Audio Recording in WordForm | PR 4 | 1 file, MediaRecorder state machine, ~80 lines |
| 5 | Shared Role Labels | PR 5 | 4 edits + 1 new file, ~36 lines |

## Phase 1: Voseo → Neutral Spanish (8 files)

- [x] 1.1 `features/landing/data/content.ts` — "Comprá"→"Compra" (L57), "Adquirí"→"Adquiere" (L59), "Descargá"→"Descarga" (L63), "Escaneá"→"Escanea" ×2 (L35, L65), "podés"→"puedes", "Recibí"→"Recibe" (L200), "Gestioná"→"Gestiona" (L259), "Visualizá"→"Visualiza" (L274)
- [x] 1.2 `features/landing/components/HowItWorks.tsx` — "Empezá"→"Empieza" (L9)
- [x] 1.3 `features/landing/components/FAQ.tsx` — "necesitás"→"necesitas" (L31)
- [x] 1.4 `features/landing/components/LeadForm.tsx` — "Querés"→"Quieres" (L115), "Dejanos"→"Déjanos" (L121), "Podés"→"Puedes" (L134)
- [x] 1.5 `features/landing/components/DemoVideo.tsx` — "Mirá"→"Mira" (L10)
- [x] 1.6 `app/page.tsx` — "iniciá"→"inicia" (L45)
- [x] 1.7 `features/email/templates/SetupPasswordEmail.tsx` — "Hacé"→"Haz" (L22), "ignorá"→"ignora" (L38)
- [x] 1.8 `app/dashboard/director/docentes/page.tsx` — "Configurá"→"Configura" (L142)

## Phase 2: Slug toLowerCase + Helper (1 file)

- [x] 2.1 `features/admin/components/InstitutionForm.tsx` — Reorder slug Zod schema: `.transform(v => v.toLowerCase())` FIRST, `.refine(…)` SECOND (used refine since Zod doesn't support regex after transform)
- [x] 2.2 Same file — Add helper text JSX below slug Input: "Slug: identificador único en la URL. Solo minúsculas, números y guiones. Ej: mi-institucion"
- [x] 2.3 Same file — Add `onChange` handler on slug input for real-time lowercase visual feedback

## Phase 3: Eliminate Parent Creation (4 files)

- [x] 3.1 `features/admin/components/UserForm.tsx` — Remove `'parent'` from `availableRoles` (L14), update `needsInstitution` to exclude `'parent'` (L15-16)
- [x] 3.2 `features/landing/components/LeadForm.tsx` — Remove `padre` entry from `ROLES` array (L6-10); remove entire `role === 'padre'` branch, leaving only the email form branch
- [x] 3.3 `app/page.tsx` — Remove `RegisterParentForm` import (L10); remove `authModalMode === 'register'` block (L126-133)
- [x] 3.4 `features/auth/components/RegisterParentForm.tsx` — Replace entire form with static info component: "Si eres apoderado, contacta a la institución educativa de tu hijo para obtener acceso." Keep same props interface (`onClose`, `onSwitchToLogin`)

## Phase 4: Audio Recording in WordForm (1 file)

- [x] 4.1 `features/docente/components/WordForm.tsx` — Add `RecordingStatus` type: `'idle' | 'recording' | 'preview'`
- [x] 4.2 Same file — Add state: `recordingStatus`, `recordedBlob`, `recordingDuration`; refs: `mediaRecorderRef`, `audioChunksRef`, `streamRef`, `timerRef`
- [x] 4.3 Same file — Conditionally render "Grabar audio" button
- [x] 4.4 Same file — On record click: `getUserMedia({ audio: true })` → `new MediaRecorder(stream)` → `start()`. Show pulsing red indicator + elapsed timer while recording
- [x] 4.5 Same file — On stop: collect chunks → blob → `new File([blob], 'grabacion.webm', { type: blob.type })`. Show `<audio src={url} controls />` preview + "Volver a grabar" button
- [x] 4.6 Same file — On submit: pass `recordedFile` as `audioFile`. Keep existing file upload working in parallel. Recording file takes priority if both exist.

## Phase 5: Shared Role Labels (4 edits + 1 new)

- [x] 5.1 Create `shared/lib/roles.ts` — Export `ROLE_LABELS: Record<string, string>` with keys: admin→Admin, director→Director, teacher→Docente, parent→Apoderado
- [x] 5.2 `shared/components/ui/Badge.tsx` — Import `ROLE_LABELS` from `shared/lib/roles.ts`; replace inline `roleLabels` with imported version
- [x] 5.3 `features/admin/components/UserForm.tsx` — Import `ROLE_LABELS`; replace `{role.charAt(0).toUpperCase() + role.slice(1)}` with `{ROLE_LABELS[role] ?? role}`
- [x] 5.4 `app/dashboard/layout.tsx` — Import `ROLE_LABELS`; replace `roleName` switch with `ROLE_LABELS[primaryRole] ?? 'Usuario'`
- [x] 5.5 `features/profile/components/ProfileForm.tsx` — Import `ROLE_LABELS`; replace `roleName` switch with `ROLE_LABELS[primaryRole] ?? 'Usuario'`
