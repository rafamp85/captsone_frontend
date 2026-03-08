# Domain Repositories

## Repository Interface + InMemory Implementation

Repository interfaces and their InMemory implementations live together in `domain/repositories/`.

`Maybe<T>` is a monadic type that replaces `null`/`undefined`. It has two states: `Some(value)` and `None`. Key methods: `isSome()`, `isNone()`, `getOrThrow()`, `fold(onNone, onSome)`, `map(fn)`, `fromNullable(value)`. Use a library like `purify-ts` or implement a simple version in the project.

```typescript
// src/orders/domain/repositories/OrderRepository.ts

// Interface
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: Id): Promise<Maybe<Order>>;
  findByCustomer(customerId: Id): Promise<Order[]>;
}

// InMemory implementation (same file)
export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  constructor(initialOrders: Order[] = []) {
    initialOrders.forEach(order => this.orders.set(order.id.value, order));
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.value, order);
  }

  async findById(id: Id): Promise<Maybe<Order>> {
    return Maybe.fromNullable(this.orders.get(id.value));
  }

  async findByCustomer(customerId: Id): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerId.equals(customerId));
  }
}
```

## Repository Characteristics

- **Domain language**: Use domain terms, not database terms
- **Entity-centric**: Work with domain entities, not primitives or DTOs
- **No implementation details**: The interface does not reveal storage mechanism

```typescript
// WORSE - Database-oriented interface
interface OrderRepository {
  insert(order: OrderDocument): Promise<void>;
  findOne(id: string): Promise<OrderDocument | null>;
}

// BETTER - Domain-oriented interface
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: Id): Promise<Maybe<Order>>;
}
```

## Real Adapter (Infrastructure)

Real adapters implement the repository interface with actual database logic. They live in `infrastructure/adapters/`.

```typescript
// src/orders/infrastructure/adapters/MongoOrderRepository.ts
export class MongoOrderRepository implements OrderRepository {
  constructor(private collection: Collection<OrderDocument>) {}

  async save(order: Order): Promise<void> {
    const document = this.toDocument(order);
    await this.collection.updateOne(
      { _id: document._id },
      { $set: document },
      { upsert: true }
    );
  }

  async findById(id: Id): Promise<Maybe<Order>> {
    const document = await this.collection.findOne({ _id: id.value });
    return Maybe.fromNullable(document).map(doc => this.toDomain(doc));
  }

  private toDocument(order: Order): OrderDocument {
    return { _id: order.id.value, ...order.toPrimitives() };
  }

  private toDomain(document: OrderDocument): Order {
    // Map MongoDB document to domain entity
  }
}
```

## When to Use Each

| Context | Use |
|---------|-----|
| UseCase unit tests | InMemoryRepository |
| Repository adapter tests | Real adapter + Real DB |
| E2E tests | Real adapter + Real DB |
| Production | Real adapter |

## File Structure

```
src/orders/
├── domain/
│   └── repositories/
│       └── OrderRepository.ts       # Interface + InMemory (same file)
└── infrastructure/
    └── adapters/
        └── MongoOrderRepository.ts  # Real adapter for production
```
