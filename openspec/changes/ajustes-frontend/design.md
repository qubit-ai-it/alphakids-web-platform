# Design: Ajustes Frontend

## Technical Approach

Five independent tasks — 4 mechanical (voseo→tuteo, slug lowercase, parent removal, shared role labels) and 1 interactive (audio recording). No new routes, no i18n, no API changes. Each task has zero cross-dependency, enabling parallel implementation.

## Architecture Decisions

### Task 1: Voseo → Tuteo (inline replace)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| i18n library | Full future-proofing but scope creep | **Rejected** — 8 files, one-time mechanical change |
| Single grep+replace pass | Fastest, zero risk | **Selected** — 1:1 string map, no logic change |

### Task 2: Slug lowercase (Zod transform)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Zod `.transform()` BEFORE `.regex()` | Pipes ejecutan en orden secuencial. Regex con mayúsculas ANTES del transform → falla | **Critical fix** — transform primero, regex después |
| + `onChange` controlled input | Real-time visual sync with user | **Selected** — avoids UX surprise |

### Task 3: Eliminate Parent

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Guard `parent` in ROLES array | All roles use email form; no more "Crea tu cuenta" | **Selected** — less code, single branch |
| Keep ROLES with special case | Dead code for padre | **Rejected** — spec says remove |

### Task 4: Audio Recording (native MediaRecorder)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| External lib (recordrtc) | Dependency, bundle size | **Rejected** — MediaRecorder suffices for webm |
| navigator.mediaDevices + MediaRecorder | Zero deps, native | **Selected** — 3 state machine, File output |

### Task 5: Shared Role Labels

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Enum class | Overhead for a label map | **Rejected** |
| `const Record<string, string>` | Simple, tree-shakeable | **Selected** — export from `shared/lib/roles.ts` |

## Data Flow

```
Task 4 — Audio Recording State Machine:
  idle ──click "Grabar"──→ recording[● pulsing red + timer]
  recording ──click "Detener"──→ preview[<audio> + "Volver a grabar"]
  preview ──"Volver a grabar"──→ idle (discard buffer)
           ──submit form──→ onSubmit(data, imageFile, recordedFile)

Task 2 — Slug transformation:
  Input onChange → React state (lowercased) → RHF value │ Zod parse → .transform(v→lowercase)
                                                         ↓
                                                    API call (always lowercase)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `features/landing/data/content.ts` | Modify | Voseo→tuteo (3 imperatives) |
| `features/landing/components/HowItWorks.tsx` | Modify | "Empezá" → "Empieza" |
| `features/landing/components/FAQ.tsx` | Modify | "necesitás" → "necesitas" |
| `features/landing/components/LeadForm.tsx` | Modify | Voseo→tuteo + remove `padre` from ROLES, remove role=padre branch |
| `features/landing/components/DemoVideo.tsx` | Modify | "Mirá" → "Mira" |
| `features/email/templates/SetupPasswordEmail.tsx` | Modify | "Hacé"→"Haz", "ignorá"→"ignora" |
| `app/page.tsx` | Modify | "iniciá"→"inicia", remove register modal block |
| `app/dashboard/director/docentes/page.tsx` | Modify | "Configurá" → "Configura" |
| `features/admin/components/InstitutionForm.tsx` | Modify | Slug: Zod `.transform(v.toLowerCase())` ANTES de `.regex()`, helper text below Input |
| `features/admin/components/UserForm.tsx` | Modify | Remove `'parent'` from `availableRoles`, update `needsInstitution`, use `ROLE_LABELS` |
| `features/auth/components/RegisterParentForm.tsx` | Modify | Replace form with static banner: "Si eres apoderado, contacta a la institución educativa" |
| `features/docente/components/WordForm.tsx` | Modify | Add MediaRecorder state machine, record button, preview UI |
| `shared/components/ui/Badge.tsx` | Modify | Import `ROLE_LABELS` from `shared/lib/roles.ts` |
| `features/profile/components/ProfileForm.tsx` | Modify | Replace role switch with `ROLE_LABELS` lookup |
| `app/dashboard/layout.tsx` | Modify | Replace roleName switch with `ROLE_LABELS` lookup |
| `shared/lib/roles.ts` | **Create** | Export `ROLE_LABELS: Record<string, string>` |

## Interfaces / Contracts

```typescript
// shared/lib/roles.ts
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  director: 'Director',
  teacher: 'Docente',
  parent: 'Apoderado',
};

// WordForm — recorded audio shape
type RecordingStatus = 'idle' | 'recording' | 'preview';
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `ROLE_LABELS` correctness | Import & assert keys + values |
| Unit | Slug transform | Zod schema parse: "ABC" → "abc" |
| E2E | LeadForm role=docente shows email input | Visit landing, select Docente, verify email field |
| E2E | WordForm record flow | Mock `getUserMedia` + `MediaRecorder`, simulate click cycle |
| Visual | Badge labels render Spanish | Snapshot test per role |

## Migration / Rollout

No migration required. All changes are client-side only. Existing parent accounts in DB unaffected.

## Resolved Questions

- [x] MediaRecorder mimeType: **browser default** — máximo compatibility, Safari no soporta opus en webm
- [x] RegisterParentForm banner: **aprobado** — "Si eres apoderado, contacta a la institución educativa de tu hijo para obtener acceso."
- [x] Slug helper text: "Slug: identificador único en la URL. Solo minúsculas, números y guiones. Ej: mi-institucion"
- [x] Slug Zod order: **transform(v → v.toLowerCase()) ANTES de regex(/^[a-z0-9-]+$/)** — corregido, ver backend PR
