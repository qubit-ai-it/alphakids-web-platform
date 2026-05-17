# AlphaKids Web Platform

Plataforma educativa web para la gestión de instituciones de nivel inicial (3-5 años).

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js | 16.2.6 |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Fuente | Onest | Google Fonts |
| Deployment | Render | - |

## Estructura del Proyecto

```
alphakids-web-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo de rutas - autenticación
│   │   │   └── login/                # Página de login
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Grupo de rutas - panel principal
│   │   │   ├── admin/                # Módulo Administrador
│   │   │   │   ├── instituciones/
│   │   │   │   │   └── page.tsx     # CRUD instituciones
│   │   │   │   ├── usuarios/
│   │   │   │   │   └── page.tsx     # Gestión de usuarios
│   │   │   │   └── metricas/
│   │   │   │       └── page.tsx     # Métricas globales
│   │   │   ├── director/             # Módulo Director
│   │   │   │   ├── grados/
│   │   │   │   │   └── page.tsx     # CRUD grados
│   │   │   │   ├── secciones/
│   │   │   │   │   └── page.tsx     # CRUD secciones
│   │   │   │   ├── docentes/
│   │   │   │   │   └── page.tsx     # Gestión de docentes
│   │   │   │   └── metricas/
│   │   │   │       └── page.tsx     # Métricas institucionales
│   │   │   └── docente/              # Módulo Docente
│   │   │       ├── aula/
│   │   │       │   └── page.tsx     # Vista del aula
│   │   │       ├── alumnos/
│   │   │       │   └── page.tsx     # CRUD alumnos
│   │   │       ├── vocabulario/
│   │   │       │   └── page.tsx     # Banco de palabras compartidas
│   │   │       ├── actividades/
│   │   │       │   └── page.tsx     # Gestión de actividades
│   │   │       └── reportes/
│   │   │           └── page.tsx     # Generación de reportes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Redirect a login o dashboard
│   │
│   ├── features/                     # Feature-based architecture
│   │   ├── auth/                     # Lógica de autenticación
│   │   │   └── components/
│   │   │       └── LoginForm.tsx
│   │   ├── admin/                    # Lógica del Administrador
│   │   │   ├── components/
│   │   │   │   ├── InstitutionForm.tsx
│   │   │   │   └── UserManagementForm.tsx
│   │   │   └── hooks/
│   │   ├── director/                 # Lógica del Director
│   │   │   ├── components/
│   │   │   │   ├── GradeForm.tsx
│   │   │   │   ├── SectionForm.tsx
│   │   │   │   └── TeacherAssignmentForm.tsx
│   │   │   └── hooks/
│   │   └── docente/                  # Lógica del Docente
│   │       ├── components/
│   │       │   ├── StudentForm.tsx      # Alta/Edición/Baja de alumnos
│   │       │   ├── WordForm.tsx         # Crear palabras con imagen
│   │       │   ├── ActivityForm.tsx      # Asignar actividades
│   │       │   └── ReportGenerator.tsx   # Generar reportes
│   │       └── hooks/
│   │
│   ├── shared/                       # Código compartido
│   │   ├── components/               # Componentes UI reutilizables
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Table.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Avatar.tsx
│   │   │       ├── DatePicker.tsx
│   │   │       └── FileUpload.tsx
│   │   ├── hooks/                    # Hooks reutilizables
│   │   │   └── useAuth.ts
│   │   └── lib/                      # Utilidades y constantes
│   │       └── utils.ts
│   │
│   └── styles/
│       └── globals.css               # Tokens de diseño
│
├── public/
│   └── favicon.ico                   # Icono de la pestaña del navegador
│
├── docs/                             # Documentación adicional
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Roles y Permisos

| Rol | Plataforma | Funcionalidades |
|-----|------------|-----------------|
| **Administrador** | Web | Gestión de instituciones, usuarios globales, métricas del sistema |
| **Director** | Web | Gestión de grados, secciones, docentes; métricas institucionales |
| **Docente** | Web | Gestión de aula, alumnos, vocabulario compartido, actividades, reportes |
| **Niño** | Móvil | Juego (OCR), mascota virtual, diccionario personal |
| **Padre** | Móvil | Supervisión, perfiles de hijos, configuración parental |

## Decisiones de Arquitectura

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| **Rendering** | SSR por defecto | Mejor performance, auth más seguro |
| **CSR** | Solo en modales y forms interactivos | `"use client"` donde sea necesario |
| **Estructura** | Feature-based | Escalabilidad, ownership claro por dominio |
| **Folder** | `src/` | Separa código de configs en root |
| **Forms** | React Hook Form + Zod | Validación tipada, mejor DX |
| **API** | REST | Backend separado en PostgreSQL |

## Diseño - Tokens CSS

### Tipografía

| Token | Size | Line-height |
|-------|------|-------------|
| Display | 56px (3.5rem) | 1.1 |
| Header 1 | 40px (2.5rem) | 1.2 |
| Header 2 | 32px (2rem) | 1.2 |
| Header 3 | 24px (1.5rem) | 1.2 |
| Header 4 | 20px (1.25rem) | 1.2 |
| Body LG | 18px (1.125rem) | 1.5 |
| Body | 16px (1rem) | 1.5 |
| Body SM | 14px (0.875rem) | 1.5 |
| Label LG | 24px (1.5rem) | 1.4 |
| Label SM | 12px (0.75rem) | 1.4 |
| Button | 22px (1.375rem) | 1.0 |
| Caption | 12px (0.75rem) | 1.4 |

### Colores Primarios

| Token | Hex |
|-------|-----|
| primary-100 | #CCEBFF |
| primary-200 | #99D6FE |
| primary-300 | #67C2FE |
| primary-400 | #34ADFD |
| primary-500 | #0199FD |
| primary-600 | #017ACA |
| primary-700 | #015C98 |
| primary-800 | #003D65 |
| primary-900 | #001F33 |

### Colores Secundarios

| Token | Hex |
|-------|-----|
| secondary-100 | #F7F7F7 |
| secondary-200 | #F0F0F0 |
| secondary-300 | #E8E8E8 |
| secondary-400 | #E1E1E1 |
| secondary-500 | #D9D9D9 |
| secondary-600 | #AEAEAE |
| secondary-700 | #828282 |
| secondary-800 | #575757 |
| secondary-900 | #2B2B2B |

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint
```

## Requerimientos de Instalación

- Node.js 18+
- pnpm 8+

## Autores

- AlphaKids Development Team

## Licencia

Privada - Todos los derechos reservados