# Design: Landing Page (campañas marketing)

## Technical Approach

Server-component-first landing at `app/(marketing)/landing/page.tsx` with 8 hardcoded sections. Single client island (`LeadForm`) for Formspree POST. Route group `(marketing)` isolates from future auth middleware. All copy in `features/landing/data/content.ts`.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Route | `/landing` vs `(marketing)/landing` | `(marketing)` | Future auth middleware scoped to `/dashboard/*`; group naturally excluded |
| Data | API vs hardcoded | Hardcoded | No backend deps; page fully static, CDN-cacheable |
| Forms | Raw fetch vs RHF | react-hook-form + Zod | Already in project, consistent with `LoginForm` |
| JSON-LD | `next/script` vs inline | Inline `<script>` | Simpler, no hydration cost |
| Layout | Page metadata vs route-group | Route-group layout | Groups future marketing pages, centralizes OG defaults |

## Data Flow

```
data/content.ts ──import──► (marketing)/landing/page.tsx
                                ├── Hero (SSR)
                                ├── FAQ (SSR) ──► JSON-LD <script>
                                └── LeadForm (CSR) ──fetch(POST)──► Formspree
```

Zero backend calls. Static HTML except form island.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `app/(marketing)/landing/page.tsx` | Create | Composition root — imports all sections |
| `app/(marketing)/layout.tsx` | Create | Route-group layout, marketing OG metadata defaults |
| `features/landing/components/Hero.tsx` | Create | Gradient hero + CTA scrolling to form |
| `features/landing/components/GameModes.tsx` | Create | 3 cards (Cámara, OCR, Speech) |
| `features/landing/components/HowItWorks.tsx` | Create | 3 numbered steps |
| `features/landing/components/Pricing.tsx` | Create | 2 pricing cards |
| `features/landing/components/ComparisonTable.tsx` | Create | Competitor table |
| `features/landing/components/FAQ.tsx` | Create | Accordion + JSON-LD schema |
| `features/landing/components/LeadForm.tsx` | Create | Client island: RHF + Zod → Formspree |
| `features/landing/components/Footer.tsx` | Create | Brand + social icons + copyright |
| `features/landing/data/content.ts` | Create | All hardcoded copy, prices, social links |
| `features/landing/schema/lead.schema.ts` | Create | Zod fields: nombre, email, teléfono, edad_hijo |
| `app/page.tsx` | Modify | Strip `'use client'`, hooks, Modal, LoginForm |

## Component Tree

```
app/(marketing)/layout.tsx                  ← SSR, minimal wrapper + OG metadata
└── app/(marketing)/landing/page.tsx        ← SSR, composition root
      ├── Hero                              ← SSR: gradient bg, heading, CTA
      ├── GameModes                         ← SSR: 3 cards from content.ts
      ├── HowItWorks                        ← SSR: 3 numbered steps
      ├── Pricing                           ← SSR: 2 plan cards
      ├── ComparisonTable                   ← SSR: 3×6 competitor grid
      ├── FAQ                               ← SSR: accordion toggle + JSON-LD
      ├── LeadForm                          ← CSR: react-hook-form → Formspree
      └── Footer                            ← SSR: brand, social, copyright
```

## Form Handling

`LeadForm.tsx`: `useForm + zodResolver(leadSchema)` → `fetch(POST https://formspree.io/f/{ID})` → on 2xx show success message; on error show inline error.

- Fields: nombre (required), email (required, valid email), teléfono (required, min 9), edad_hijo (number, range 3-6)
- Zod schema in `lead.schema.ts` → inferred type + validation
- Already in deps: `react-hook-form`, `@hookform/resolvers`, `zod`
- Formspree ID comes from marketing team (env var `NEXT_PUBLIC_FORMSPREE_ID`)

## JSON-LD

SSR `<script type="application/ld+json">` inside `FAQ.tsx`:

```tsx
const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(q => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: { "@type": "Answer", text: q.answer }
  }))
};
```

Zero client cost. Validates for Google Rich Results FAQ carousel.

## Responsive Strategy

Mobile-first: all sections default to single-column. Breakpoints:
- `sm` (640px): 2-column grids
- `md` (768px): 3-column game modes, side-by-side pricing, horizontal steps
- `lg` (1024px): max-width container centering

Comparison table: card layout on mobile, `<table>` on `md+`.

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Formspree CORS/block | Low | Toast error + retry; data in state |
| `app/page.tsx` migration breaks build | Low | Run `pnpm build` immediately after; rollback if fails |
| JSON-LD invalid syntax | Low | Verify with Google Rich Results Test post-deploy |
| No test runner configured | High | `pnpm build` as smoke test; visual inspection |

## Open Questions

- [ ] Formspree form ID — marketing team to provide (put in `.env` as `NEXT_PUBLIC_FORMSPREE_ID`)
- [ ] Social account URLs — Instagram, TikTok, WhatsApp, YouTube exact handles
- [ ] Confirm middleware plans — `(marketing)` exclusion strategy, if middleware added later
