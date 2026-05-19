# AlphaKids - Schema de Base de Datos

Base de datos PostgreSQL para la plataforma AlphaKids.

## notation: Chen | colorMode: bold | styleMode: watercolor | typeface: mono

---

## CAPA 1 — AUTENTICACIÓN

### users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `email` | VARCHAR(255) | Email único del usuario |
| `password_hash` | VARCHAR(255) | Hash de contraseña (bcrypt) |
| `is_active` | BOOLEAN | Si la cuenta está activa |
| `last_login_at` | TIMESTAMP | Última fecha de login |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### user_profiles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users.id |
| `first_name` | VARCHAR(100) | Nombre |
| `last_name` | VARCHAR(100) | Apellido |
| `phone` | VARCHAR(20) | Teléfono |
| `avatar_url` | TEXT | URL del avatar |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### user_preferences
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → users.id |
| `locale` | VARCHAR(10) | Idioma preferido |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

---

## CAPA 2 — RBAC (Roles y Permisos)

### roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(50) | Nombre del rol (admin, director, docente) |
| `description` | TEXT | Descripción del rol |
| `created_at` | TIMESTAMP | Fecha de creación |

### permissions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Nombre del permiso |
| `description` | TEXT | Descripción del permiso |

### role_permissions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role_id` | UUID | Foreign Key → roles.id |
| `permission_id` | UUID | Foreign Key → permissions.id |

### user_roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | UUID | Foreign Key → users.id |
| `role_id` | UUID | Foreign Key → roles.id |
| `assigned_at` | TIMESTAMP | Fecha de asignación |
| `assigned_by` | UUID | Foreign Key → users.id (quien asignó) |

---

## CAPA 3 — ESTRUCTURA INSTITUCIONAL

### institutions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(150) | Nombre de la institución |
| `slug` | VARCHAR(150) | Slug para URLs |
| `ruc` | VARCHAR(20) | RUC de la institución |
| `address` | TEXT | Dirección |
| `phone` | VARCHAR(20) | Teléfono |
| `logo_url` | TEXT | URL del logo |
| `is_active` | BOOLEAN | Si está activa |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### institution_members
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `institution_id` | UUID | Foreign Key → institutions.id |
| `user_id` | UUID | Foreign Key → users.id |
| `role_in_institution` | ENUM | Rol específico dentro de la institución |
| `joined_at` | TIMESTAMP | Fecha de ingreso |
| `left_at` | TIMESTAMP | Fecha de salida (null si activo) |

### grades
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `institution_id` | UUID | Foreign Key → institutions.id |
| `name` | VARCHAR(50) | Nombre del grado (Inicial I, II, III) |
| `age_range_min` | SMALLINT | Edad mínima |
| `age_range_max` | SMALLINT | Edad máxima |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### sections
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `grade_id` | UUID | Foreign Key → grades.id |
| `teacher_id` | UUID | Foreign Key → users.id (docente asignado) |
| `name` | VARCHAR(10) | Nombre de la sección (A, B, C) |
| `capacity` | SMALLINT | Capacidad máxima de alumnos |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

---

## CAPA 4 — ESTUDIANTES

### students
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `institution_id` | UUID | Foreign Key → institutions.id |
| `section_id` | UUID | Foreign Key → sections.id |
| `first_name` | VARCHAR(100) | Nombre del estudiante |
| `last_name` | VARCHAR(100) | Apellido del estudiante |
| `birth_date` | DATE | Fecha de nacimiento |
| `gender` | ENUM | Género (MALE, FEMALE, OTHER) |
| `avatar_url` | TEXT | URL del avatar |
| `is_active` | BOOLEAN | Si está activo |
| `registered_by` | UUID | Foreign Key → users.id (quien registró) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

---

## CAPA 5 — PALABRAS Y ASIGNACIONES

### words
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `text` | VARCHAR(100) | Palabra o texto |
| `difficulty_label` | ENUM | Dificultad (INICIAL, BASICO, INTERMEDIO, AVANZADO, EXPERTO) |
| `image_url` | TEXT | URL de imagen asociada |
| `audio_url` | TEXT | URL de audio asociado |
| `is_active` | BOOLEAN | Si la palabra está activa |
| `created_by` | UUID | Foreign Key → users.id (quien la creó) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### word_assignments
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `word_id` | UUID | Foreign Key → words.id |
| `assigned_by` | UUID | Foreign Key → users.id (quien asignó) |
| `student_id` | UUID | Foreign Key → students.id |
| `section_id` | UUID | Foreign Key → sections.id |
| `status` | ENUM | Estado (PENDING, COMPLETED, EXPIRED) |
| `scheduled_at` | TIMESTAMP | Fecha programada |
| `expires_at` | TIMESTAMP | Fecha de expiración |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

---

## CAPA 6 — AUDITORÍA

### audit_logs
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `table_name` | VARCHAR(100) | Nombre de la tabla afectada |
| `record_id` | UUID | ID del registro afectado |
| `action` | ENUM | Tipo de acción (INSERT, UPDATE, DELETE) |
| `old_values` | JSONB | Valores anteriores |
| `new_values` | JSONB | Valores nuevos |
| `performed_by` | UUID | Foreign Key → users.id |
| `ip_address` | INET | Dirección IP |
| `performed_at` | TIMESTAMP | Fecha y hora de la acción |

---

## RELACIONES

### CAPA 1 — Autenticación
```
users (1:1) user_profiles
users (1:1) user_preferences
```

### CAPA 2 — RBAC
```
users (N:M) roles ← user_roles (tabla pivote)
roles (N:M) permissions ← role_permissions (tabla pivote)
```

### CAPA 3 — Estructura Institucional
```
users (N:M) institutions ← institution_members (tabla pivote)
institutions (1:N) grades
grades (1:N) sections
users (1:1) sections ← sections.teacher_id = users.id
```

### CAPA 4 — Estudiantes
```
sections (1:N) students
institutions (1:N) students (desnormalización controlada)
users (1:N) students ← students.registered_by = users.id
```

### CAPA 5 — Palabras y Asignaciones
```
users (1:N) words ← words.created_by = users.id
words (1:N) word_assignments ← word_assignments.word_id = words.id
students (1:N) word_assignments ← word_assignments.student_id = students.id
sections (1:N) word_assignments ← word_assignments.section_id = sections.id
users (1:N) word_assignments ← word_assignments.assigned_by = users.id
```

### CAPA 6 — Auditoría
```
users (1:N) audit_logs
```

---

## LEYENDA

| Símbolo | Significado |
|---------|-------------|
| `[connection: <>]` | Tabla pivote (relación N:M) |
| `[connection: -]` | Relación 1:1 |
| `[connection: <]` | Relación 1:N |

| Color | Etiqueta |
|-------|----------|
| 🔴 red | Autenticación y Perfiles |
| 🟣 purple | RBAC - Roles y Permisos |
| 🟡 yellow | Estructura Institucional |
| 🟢 green | Estudiantes |
| 🔵 blue | Palabras y Asignaciones |
| 🟠 orange | Auditoría |

---

## NOTAS DE IMPLEMENTACIÓN

1. **Docentes y secciones**: Cada docente está vinculado a sus secciones mediante `sections.teacher_id`. Para obtener las secciones de un docente: `SELECT * FROM sections WHERE teacher_id = ?`

2. **Alumnos por sección**: Para obtener los alumnos de la sección de un docente:
   ```sql
   SELECT s.* FROM students s
   JOIN sections sec ON s.section_id = sec.id
   WHERE sec.teacher_id = ?
   ```

3. **Instituciones por usuario**: Para obtener las instituciones de un usuario:
   ```sql
   SELECT i.* FROM institutions i
   JOIN institution_members im ON i.id = im.institution_id
   WHERE im.user_id = ?
   ```

4. **Roles de un usuario**: Para obtener los roles de un usuario:
   ```sql
   SELECT r.* FROM roles r
   JOIN user_roles ur ON r.id = ur.role_id
   WHERE ur.user_id = ?
   ```

5. **Palabras asignadas a un alumno**: Para obtener las palabras asignadas a un estudiante:
   ```sql
   SELECT w.text, w.difficulty_label, wa.status, wa.scheduled_at
   FROM word_assignments wa
   JOIN words w ON w.id = wa.word_id
   WHERE wa.student_id = ?
   ORDER BY wa.scheduled_at DESC
   ```

6. **Asignaciones por sección**: Para obtener todas las asignaciones de una sección:
   ```sql
   SELECT wa.*, w.text, s.first_name, s.last_name
   FROM word_assignments wa
   JOIN words w ON w.id = wa.word_id
   JOIN students s ON s.id = wa.student_id
   WHERE wa.section_id = ?
   ```