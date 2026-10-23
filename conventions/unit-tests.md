# Unit Test Conventions

Unit tests exercise one class or a small cluster of pure functions in isolation. They run in milliseconds, touch no I/O, and never share mutable state between tests.

## One assertion concept per test

A test verifies one observable concept. Several assertion calls are fine when they describe the same concept:

```csharp
// One concept: the created user looks right.
user.Name.Should().Be("Ada");
user.Email.Should().Be("ada@example.com");
user.IsActive.Should().BeTrue();
```

Split when the concepts differ:

```csharp
// Two concepts - two tests:
CreateOrder_ValidInput_ReturnsPersistedOrder()
CreateOrder_ValidInput_SendsConfirmationEmail()
```

## Test data builders

Complex objects are built with builders, never assembled inline in each test:

```csharp
var customer = new CustomerBuilder()
    .WithTier(CustomerTier.Gold)
    .WithDefaultAddress()
    .Build();
```

Builders live in `<Project>.Tests/Builders/` and ship sensible defaults: a bare `new CustomerBuilder().Build()` must produce a valid object. Tests override only the fields that matter to the scenario.

## Fixtures and factories

- Class fixtures for expensive, read-only setup shared by one test class: an in-memory container, a seeded fake.
- Collection fixtures only when the resource cannot be parallelized; name the collection after the resource.
- Never mutate fixture state from a test. Tests must be order-independent; the runner may shuffle them.
- Factories produce fresh objects per test; fixtures provide shared, immutable infrastructure. Do not mix the two roles.

## Doubles

Fakes over mocks for stateful collaborators; mocks only to verify outgoing interactions such as emails sent or events published. Do not mock types you do not own: wrap third-party clients behind an interface and fake that interface.

## Why

Small, concept-focused tests fail precisely: the name tells you what regressed, and the single Act call points at where.
