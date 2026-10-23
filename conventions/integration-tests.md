# Integration Test Conventions

Integration tests verify that our code works against real infrastructure: databases, queues, HTTP services. They are slower than unit tests and live in a separate project so each layer runs at the right time.

## Unit vs integration split

| Property | Unit | Integration |
| --- | --- | --- |
| Dependencies | in-memory fakes | real database / broker in containers |
| Speed budget | under 10 ms each | under 2 s each |
| Project | `<Product>.Tests` | `<Product>.IntegrationTests` |
| CI stage | every push | every push, after the unit stage |
| Parallelism | full | limited by container resources |

A behavior covered by an integration test is not re-covered by a unit test with mocked plumbing: cover the decision logic in unit tests and the wiring once in integration.

## Ground rules

- Each test class gets its own database schema or topic suffix derived from the class name. Tests never share tables.
- State is created through the public API of the system under test (or its repository), not by hand-written inserts that duplicate migration logic. Seed scripts are the exception for reference data.
- Clean up what you create even on failure; use the framework's async disposal hooks, not "the next run will overwrite it".
- No sleeps. Poll with a deadline using the runner's retry helper: `Eventually(...).Should(...)`.

## External services

Third-party HTTP dependencies run against a local stub server with recorded responses, never against a live sandbox. The stub's expectations are configured per test, inside the test.

## What belongs here

Repository query behavior, serialization round-trips, message handler wiring, schema migrations, and HTTP middleware pipelines. Business rules belong in the unit suite even when an integration test could reach them.

## Why

A strict split keeps the fast suite fast enough to run on every save, while the integration suite proves the wiring that fakes can only guess at.
