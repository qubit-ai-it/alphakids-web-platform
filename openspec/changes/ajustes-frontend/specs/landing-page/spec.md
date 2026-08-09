# Delta for Landing Page

## MODIFIED Requirements

### R4: How It Works

The system MUST render 3 sequential steps with numbering: "Compra el kit (S/ 75)", "Descarga la app", "Tu hijo aprende jugando".
(Previously: used voseo forms "Comprá", "Descargá", "Empezá")

#### Scenario: Steps in order

- GIVEN the How It Works section
- THEN steps 1–3 appear with numbers and descriptions
- AND all verb forms use tuteo ("Compra", "Descarga", "Empieza")

### R7: FAQ with JSON-LD

The system MUST render 6 expandable FAQ items and embed `<script type="application/ld+json">` with valid FAQPage schema. Clicking a question SHALL toggle its answer.
(Previously: subtitle used "necesitás" voseo form)

#### Scenario: Toggle behavior

- GIVEN an FAQ item
- WHEN the user clicks the question
- THEN the answer expands or collapses

#### Scenario: Neutral Spanish subtitle

- GIVEN the FAQ section renders
- THEN the subtitle reads "Todo lo que necesitas saber antes de comprar."
- AND does NOT contain voseo forms

## ADDED Requirements

### R12: Neutral Spanish (Tuteo) Throughout

All landing page components SHALL use standard Spanish (tuteo) verb forms. Voseo forms MUST NOT appear in any landing file, email template, or dashboard page listed in the change scope.

#### Scenario: No voseo in landing content

- GIVEN `features/landing/data/content.ts`
- THEN "Comprá" reads "Compra", "Descargá" reads "Descarga", "Escaneá" reads "Escanea"

#### Scenario: No voseo in headers

- GIVEN `HowItWorks.tsx`
- THEN the heading reads "Empieza en 3 pasos"

#### Scenario: No voseo in demo video

- GIVEN `DemoVideo.tsx`
- THEN the subtitle reads "Mira cómo los niños aprenden"

#### Scenario: No voseo in lead form

- GIVEN `LeadForm.tsx`
- THEN the heading reads "¿Quieres probar una demo?"
- AND the description uses "registrarte" and "Déjanos" instead of "registrándote" and "Dejanos"

#### Scenario: No voseo in email

- GIVEN `SetupPasswordEmail.tsx`
- THEN "Hacé clic" reads "Haz clic" and "ignorá" reads "ignora"

#### Scenario: No voseo in dashboard

- GIVEN `app/dashboard/director/docentes/page.tsx`
- THEN the email subject reads "Configura tu contraseña en AlphaKids"

#### Scenario: No voseo in toast messages

- GIVEN `app/page.tsx`
- THEN "iniciá sesión" reads "inicia sesión"

### R13: Parent Lead Form Action Removed

> ⚠️ **Superseded by `parent-flow-refactor` change.** The new flow has padre submitting email + name only, then receiving a QR for the KMP app download — different from what R13 originally specified.

The LeadForm SHALL NOT show a "Crea tu cuenta" button for the `padre` role. When role is `padre`, the form SHALL show the same email input + submit button as other roles instead of the registration redirect.

#### Scenario: Parent sees email form

- GIVEN the LeadForm is visible
- WHEN the user selects "Padre / Madre de familia" as role
- THEN the form shows email input + "Enviar" button (same as "Docente" and "Director" roles)
- AND no "Crea tu cuenta" button appears
