# Landing Page Specification

## Purpose

Marketing landing page at `/landing` (SSR, server component) for digital ad campaigns targeting parents in Peru. Captures leads via Formspree. Independent from portal, auth, and dashboard.

## Requirements

### R1: Route & Rendering

The system MUST render the landing page at `GET /landing` as a server component. The page SHALL NOT require authentication.

#### Scenario: Unauthenticated access

- GIVEN a user navigates to `/landing`
- WHEN the page loads
- THEN all 8 sections render without redirect

### R2: Hero Section

The hero MUST show title "Aprendizaje de palabras que cobra vida", a phygital subtitle, and CTA "Quiero saber más" that scrolls to the lead form. Background SHALL use `from-primary-500 via-primary-400 to-primary-600` gradient with floating icons.

#### Scenario: CTA scroll

- GIVEN the hero is visible
- WHEN the user clicks "Quiero saber más"
- THEN the page scrolls to the lead form

### R3: Game Modes Cards

The system MUST render 3 hardcoded cards (Cámara, OCR, Speech to Text) with icon, title, description, and accent. Data SHALL be static.

#### Scenario: Three cards

- GIVEN the Game Modes section
- THEN 3 cards with icon + title + description display

### R4: How It Works

The system MUST render 3 sequential steps with numbering: "Comprá el kit (S/ 75)", "Descargá la app", "Tu hijo aprende jugando".

#### Scenario: Steps in order

- GIVEN the How It Works section
- THEN steps 1–3 appear with numbers and descriptions

### R5: Pricing Cards

The system MUST render "Plan Anual" (S/75 — kit + app 1er año) and "Renovación" (S/35/año). Each SHALL show price and features.

#### Scenario: Both cards

- GIVEN the Pricing section
- THEN Plan Anual and Renovación cards show correct prices

### R6: Comparison Table

The system MUST render a hardcoded table: AlphaKids vs Khan Academy Kids vs Duolingo ABC across 6 criteria (En español, Kit físico, IA adaptativa, Panel padres, Sin internet, Precio).

#### Scenario: Table renders

- GIVEN the Comparison section
- THEN all 3 competitors and 6 criteria display

### R7: FAQ with JSON-LD

The system MUST render 6 expandable FAQ items and embed `<script type="application/ld+json">` with valid FAQPage schema. Clicking a question SHALL toggle its answer.

#### Scenario: Toggle behavior

- GIVEN an FAQ item
- WHEN the user clicks the question
- THEN the answer expands or collapses

#### Scenario: JSON-LD schema

- GIVEN the page HTML source
- THEN a `<script type="application/ld+json">` with FAQPage schema exists

### R8: Lead Capture Form

The form MUST collect Nombre, Email, Teléfono, Edad del hijo; validate with Zod; POST to Formspree; show "¡Gracias! Te contactaremos pronto" on 2xx. Implemented as client component with react-hook-form.

#### Scenario: Happy path

- GIVEN the form is visible
- WHEN the user fills valid data and submits
- THEN the form POSTs to Formspree and shows success

#### Scenario: Validation error

- GIVEN the form is visible
- WHEN the user submits with empty required fields
- THEN inline errors display and no POST occurs

### R9: Footer

The footer MUST show AlphaKids brand, social icons (Instagram, TikTok, WhatsApp, YouTube), and copyright.

#### Scenario: Social links

- GIVEN the footer
- THEN 4 social media icons with links render

### R10: app/page.tsx Migration

The system SHALL strip `'use client'` and hooks from `app/page.tsx`, converting it to a pure server component.

#### Scenario: Build passes

- GIVEN the codebase
- WHEN `pnpm build` runs
- THEN `app/page.tsx` compiles without client directive errors

### R11: No Side Effects

The system SHALL NOT modify middleware, auth, dashboard, layout root, or files outside `app/landing/`, `features/landing/`, and `app/page.tsx`.

#### Scenario: Zero drift

- GIVEN the git diff
- THEN no files outside allowed paths are changed
