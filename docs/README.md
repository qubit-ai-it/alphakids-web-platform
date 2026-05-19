# AlphaKids Web Platform

Plataforma educativa web para la gestión de instituciones de nivel inicial (3-5 años).

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js | 16.2.6 |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Fuente | Onest | Google Fonts |
| Deployment | Render | - |

## Estructura del Proyecto

```
alphakids-web-platform/
├── app/
│   ├── (auth)/                       # Grupo de rutas - autenticación
│   │   ├── login/page.tsx            # Redirect a /
│   │   ├── register/page.tsx         # Página de registro
│   │   └── perfil/page.tsx           # Perfil de usuario
│   ├── dashboard/                    # Panel principal (protegido)
│   │   ├── layout.tsx                # Layout con sidebar + auth guard
│   │   ├── page.tsx                  # Redirect por rol
│   │   ├── admin/                    # Módulo Administrador
│   │   │   ├── instituciones/page.tsx   # CRUD instituciones
│   │   │   ├── usuarios/page.tsx        # CRUD usuarios
│   │   │   └── metricas/page.tsx        # Métricas (próximamente)
│   │   ├── director/                 # Módulo Director
│   │   │   ├── grados/page.tsx          # CRUD grados
│   │   │   ├── secciones/page.tsx       # CRUD secciones
│   │   │   ├── docentes/page.tsx        # Docentes (próximamente)
│   │   │   └── metricas/page.tsx        # Métricas (próximamente)
│   │   └── docente/                  # Módulo Docente
│   │       ├── aula/page.tsx            # Aula (próximamente)
│   │       ├── alumnos/page.tsx         # CRUD alumnos
│   │       ├── palabras/page.tsx        # CRUD palabras
│   │       └── asignaciones/page.tsx    # CRUD asignaciones
│   ├── layout.tsx                    # Root layout (AuthProvider + fonts)
│   ├── page.tsx                      # Landing page + modal login
│   └── globals.css                   # Tokens de diseño + clases utilitarias
│
├── features/                         # Feature-based architecture
│   ├── auth/                         # Autenticación
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── services/
│   │       └── auth.service.ts
│   ├── admin/                        # Lógica del Administrador
│   │   ├── components/
│   │   │   ├── UserForm.tsx
│   │   │   └── InstitutionForm.tsx
│   │   └── services/
│   │       ├── users.service.ts
│   │       └── institutions.service.ts
│   ├── director/                     # Lógica del Director
│   │   ├── components/
│   │   │   ├── GradeForm.tsx
│   │   │   └── SectionForm.tsx
│   │   └── services/
│   │       ├── grades.service.ts
│   │       └── sections.service.ts
│   └── docente/                      # Lógica del Docente
│       ├── components/
│       │   ├── StudentForm.tsx
│       │   ├── WordForm.tsx
│       │   └── WordAssignmentForm.tsx
│       └── services/
│           ├── students.service.ts
│           ├── words.service.ts
│           └── word-assignments.service.ts
│
├── shared/                           # Código compartido
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Botón con 5 tamaños (xs-xl) + variantes
│   │   │   ├── Input.tsx             # Input con label y error
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx             # Tabla con loading/empty/error states
│   │   │   ├── Badge.tsx             # Badge con variantes por rol/estado
│   │   │   └── ConfirmDialog.tsx     # Modal de confirmación
│   │   └── auth/
│   │       ├── AuthHeader.tsx
│   │       ├── PasswordInput.tsx
│   │       └── SocialButton.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx           # Contexto de autenticación global
│   ├── hooks/
│   │   └── useAuth.ts               # Hook para consumir AuthContext
│   └── lib/
│       ├── api-client.ts            # Cliente HTTP con fetch + Bearer token
│       ├── types.ts                 # Tipos compartidos (User, Grade, etc.)
│       └── jwt.ts                   # Decodificación JWT + getInstitutionId
│
├── docs/
│   ├── README.md                    # Esta documentación
│   └── database-schema.md           # Schema de base de datos
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
| **Director** | Web | Gestión de grados, secciones; asignación de docentes; métricas institucionales |
| **Docente** | Web | Gestión de alumnos, diccionario de palabras, asignaciones palabra-alumno |
| **Padre** | Móvil | Supervisión, perfiles de hijos, configuración parental |

## Decisiones de Arquitectura

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| **Rendering** | SSR por defecto | Mejor performance, auth más seguro |
| **CSR** | Solo en modales y forms interactivos | `"use client"` donde sea necesario |
| **Estructura** | Feature-based | Escalabilidad, ownership claro por dominio |
| **Forms** | React Hook Form + Zod | Validación tipada, mejor DX |
| **API** | REST | Backend NestJS separado en PostgreSQL |
| **Auth** | JWT + Contexto React | Token en localStorage, perfil en contexto global |
| **Login** | Modal sobre landing page | Sin ruta separada, acceso directo desde `/` |
| **Buttons** | 5 tamaños (xs-xl) + 6 variantes | Reutilizables vía CSS classes en globals.css |

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
