# Module Structure Details

## Full Directory Tree

```
src/
└── [module-name]/
    ├── domain/
    │   ├── entities/
    │   │   └── [Entity].ts
    │   ├── value-objects/
    │   │   └── [ValueObject].ts
    │   ├── services/
    │   │   └── [DomainService].ts
    │   └── repositories/
    │       └── [Repository].ts      # Interface + InMemory implementation
    ├── application/
    │   ├── [UseCase].ts
    │   ├── [Request].ts             # Request DTO (if >3 params)
    │   ├── [DTO].ts                 # Response DTO
    │   └── ports/
    │       └── [ExternalService].ts # External service ports (driven)
    ├── infrastructure/
    │   ├── adapters/
    │   │   ├── [RepositoryImpl].ts
    │   │   └── [ApiClient].ts
    │   └── http/
    │       └── [Controller].ts
    └── tests/
        ├── unit/
        │   ├── [Entity].test.ts
        │   ├── [ValueObject].test.ts
        │   └── [UseCase].test.ts
        ├── integration/
        │   └── [Repository].integration.test.ts
        └── e2e/
            └── [Controller].e2e.test.ts
```

## File Naming Examples

```typescript
// Domain - entities/
Order.ts              // Entity

// Domain - value-objects/
Money.ts              // Value Object
OrderId.ts            // Value Object
PositiveNumber.ts     // Value Object

// Domain - services/
PricingService.ts     // Domain Service (function module)

// Domain - repositories/
OrderRepository.ts    // Interface + InMemory implementation

// Application
CreateOrderUseCase.ts
CalculateInvoiceUseCase.ts
PaymentGateway.ts     // External service port (interface)
InvoiceNotifier.ts    // External service port (interface)

// Infrastructure
MongoOrderRepository.ts     // Repository adapter
StripePaymentAdapter.ts     // External service adapter
EmailInvoiceNotifier.ts     // External service adapter
OrderController.ts          // HTTP controller
```

## Cross-Module Communication Rules

### Allowed imports from another module

```typescript
// GOOD - Importing domain and repositories from another module
import { Product } from '../../products/domain/entities/Product';
import { ProductRepository } from '../../products/domain/repositories/ProductRepository';
```

### Forbidden imports from another module

```typescript
// BAD - Importing a UseCase from another module
import { CreateProductUseCase } from '../../products/application/CreateProductUseCase';
```

## Ports and Adapters Examples

### Repository (Domain)

```typescript
// src/invoices/domain/repositories/InvoiceRepository.ts
export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findById(id: Id): Promise<Maybe<Invoice>>;
  findByCustomer(customerId: Id): Promise<Invoice[]>;
}

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private invoices: Map<string, Invoice> = new Map();
  // ... InMemory implementation
}
```

### External Service Port (Application)

```typescript
// src/invoices/application/ports/InvoiceNotifier.ts
export interface InvoiceNotifier {
  notifyInvoiceCreated(invoice: Invoice): Promise<void>;
  notifyPaymentReceived(invoiceId: Id): Promise<void>;
}
```

### Adapter (Infrastructure)

```typescript
// src/invoices/infrastructure/adapters/MongoInvoiceRepository.ts
import { InvoiceRepository } from '../../domain/repositories/InvoiceRepository';

export class MongoInvoiceRepository implements InvoiceRepository {
  async save(invoice: Invoice): Promise<void> {
    // MongoDB implementation
  }

  async findById(id: Id): Promise<Maybe<Invoice>> {
    // MongoDB implementation - use Maybe.fromNullable()
  }
}
```
