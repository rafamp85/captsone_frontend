---
name: Frontend Template React
overview: Crear una plantilla de frontend React con arquitectura hexagonal que siga las mismas convenciones del backend-template, usando Vite como bundler y con soporte para conectarse al backend real o usar una API mockeada.
todos:
  - id: setup-vite
    content: "Configurar Vite: package.json, vite.config.ts, tsconfig.json, index.html"
    status: completed
  - id: shared-domain
    content: "Crear shared/domain: Maybe.ts, DomainError.ts, Id.ts con tests"
    status: completed
  - id: shared-infra
    content: "Crear shared/infrastructure: HttpClient.ts, factory.ts, globals.css"
    status: completed
  - id: health-domain
    content: "Crear health/domain: Health entity + HealthRepository + InMemory + tests"
    status: completed
    dependencies:
      - shared-domain
  - id: health-application
    content: "Crear health/application: HealthUseCase + HealthDTO + tests"
    status: completed
    dependencies:
      - health-domain
  - id: health-ui
    content: "Crear health/infrastructure/ui: Hook, Component, CSS Module + tests"
    status: completed
    dependencies:
      - health-application
  - id: health-adapter
    content: "Crear health/infrastructure/adapters: HttpHealthRepository + integration test"
    status: completed
    dependencies:
      - shared-infra
      - health-domain
  - id: health-e2e
    content: Crear tests/e2e/Health.spec.ts con Playwright
    status: completed
    dependencies:
      - app-wiring
  - id: app-wiring
    content: Crear App.tsx, main.tsx, integrar routing y factory
    status: completed
    dependencies:
      - health-ui
      - health-adapter
  - id: testing-config
    content: Configurar Jest + Testing Library + Playwright base
    status: completed
    dependencies:
      - setup-vite
---

# Frontend Template con Arquitectura Hexagonal

## Resumen

Migrar la estructura actual a una aplicación React con Vite, implementando el módulo `health` como ejemplo de la arquitectura hexagonal, siguiendo todas las reglas definidas en `.cursor/rules/`.

## Estructura de Directorios

```
src/
├── shared/
│   ├── domain/
│   │   ├── DomainError.ts
│   │   ├── Maybe.ts
│   │   └── value-objects/
│   │       └── Id.ts
│   └── infrastructure/
│       ├── http/
│       │   └── HttpClient.ts         # Interface + FetchHttpClient
│       ├── factory.ts                # Wiring de dependencias
│       └── ui/
│           └── globals.css           # Variables CSS + reset
├── health/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Health.ts
│   │   └── repositories/
│   │       └── HealthRepository.ts   # Interface + InMemory
│   ├── application/
│   │   ├── HealthUseCase.ts
│   │   └── HealthDTO.ts
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   └── HttpHealthRepository.ts
│   │   └── ui/
│   │       ├── Health.tsx
│   │       ├── Health.hook.ts
│   │       └── Health.module.css
│   └── tests/
│       ├── unit/
│       │   ├── domain/
│       │   │   └── Health.test.ts
│       │   ├── application/
│       │   │   └── HealthUseCase.test.ts
│       │   └── infrastructure/
│       │       └── ui/
│       │           ├── Health.hook.test.ts
│       │           └── Health.test.tsx
│       ├── integration/
│       │   └── HttpHealthRepository.integration.test.ts
│       └── e2e/
│           └── Health.spec.ts
├── App.tsx                           # Router principal
├── main.tsx                          # Entry point
└── index.css                         # Import globals
```

## Dependencias Principales

- **React 19** + **React Router 7**
- **Vite 6** como bundler
- **@testing-library/react** para tests de hooks y componentes
- **Playwright** para E2E (configuración base)

## Implementaciones Clave

### 1. HttpClient Switcheable

```typescript
// Configuración via variable de entorno
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
```

- `VITE_API_URL=http://localhost:3000/api` - Backend real
- Sin variable o `/api` - Desarrollo local/mock

### 2. Factory con Soporte Mock

El [factory.ts](src/shared/infrastructure/factory.ts) permitirá:

- Modo **producción**: HttpHealthRepository conectado al backend
- Modo **desarrollo**: InMemoryHealthRepository con datos de prueba

### 3. Patrón Container (según reglas)

Siguiendo [frontend-components.mdc](.cursor/rules/frontend-components.mdc):

- `Health` - Componente presentacional (testeable con InMemory)
- `HealthContainer` - Usa Factory (para routing)

### 4. Hook Pattern (según reglas)

Siguiendo [frontend-hooks.mdc](.cursor/rules/frontend-hooks.mdc):

- Un solo `useState` con estado agrupado
- Sin `useEffect` dentro del hook
- UseCase recibido como parámetro
- Retorno sin destructuring

## Flujo de Datos

```mermaid
flowchart LR
    subgraph UI[Infrastructure UI]
        Container[HealthContainer]
        Component[Health]
        Hook[useHealth]
    end
    
    subgraph App[Application]
        UseCase[HealthUseCase]
        DTO[HealthDTO]
    end
    
    subgraph Domain[Domain]
        Entity[Health Entity]
        Repo[HealthRepository]
    end
    
    subgraph Infra[Infrastructure Adapters]
        HttpRepo[HttpHealthRepository]
        InMemory[InMemoryHealthRepository]
    end
    
    Container -->|Factory.create| UseCase
    Container --> Component
    Component --> Hook
    Hook -->|execute| UseCase
    UseCase -->|returns| DTO
    UseCase --> Repo
    Repo -.->|implements| HttpRepo
    Repo -.->|implements| InMemory
```

## Archivos a Modificar/Crear

| Archivo | Accion |

|---------|--------|

| [package.json](package.json) | Actualizar con deps de React/Vite |

| [tsconfig.json](tsconfig.json) | Ajustar para Vite + React |

| [vite.config.ts](vite.config.ts) | Nuevo - config Vite |

| [jest.config.js](jest.config.js) | Actualizar para React Testing Library |

| `src/shared/**` | Nuevo - DomainError, Maybe, Id, HttpClient, Factory |

| `src/health/**` | Nuevo - Modulo completo con tests |

| `src/App.tsx` | Nuevo - Router principal |

| `src/main.tsx` | Nuevo - Entry point |

| `playwright.config.ts` | Nuevo - Config base E2E |

| `index.html` | Nuevo - HTML entry para Vite |

## Fases de Implementacion

### Fase 1: Configuracion Base

Configurar Vite, actualizar dependencias, crear estructura de carpetas.

### Fase 2: Shared Domain

Implementar Maybe, DomainError, Id (copiar del backend adaptando).

### Fase 3: Shared Infrastructure

Crear HttpClient, Factory base, globals.css con theming.

### Fase 4: Health Module (Inside-Out)

Siguiendo TDD y el orden inside-out:

1. Health entity + unit tests (`tests/unit/domain/`)
2. InMemoryHealthRepository
3. HealthUseCase + unit tests (`tests/unit/application/`)
4. useHealth hook + unit tests (`tests/unit/infrastructure/ui/`)
5. Health component + unit tests (`tests/unit/infrastructure/ui/`)
6. HttpHealthRepository + integration tests (`tests/integration/`)

### Fase 5: Wiring Final

App.tsx con routing, main.tsx, verificar que todo funciona.

### Fase 6: E2E Tests

Tests end-to-end con Playwright (`tests/e2e/Health.spec.ts`) para el flujo completo de Health:

- Verificar que la pagina de health carga correctamente
- Mostrar el estado del sistema
- Manejo de errores de conexion