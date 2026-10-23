# Coverage Expectations

Coverage is a floor, not a target. The numbers below stop the obvious gaps, but a green metric never excuses a missing test for risky behavior.

## Per layer

| Layer | Line coverage | Notes |
| --- | --- | --- |
| Domain / business logic | 90% or more | Branches too; this layer is pure and cheap to test. |
| Application services | 85% or more | Happy path plus every error branch. |
| Infrastructure (repos, gateways) | integration-verified | Measured by the integration suite, no line target. |
| HTTP / UI controllers | 75% or more | Thin by design; push logic down. |
| E2E | journey list, not a percentage | Every revenue- or trust-critical journey has a spec. |

Coverage is measured per changed package in CI. The gate compares the diff coverage of the pull request (must meet the layer floor) and the absolute coverage of the package (must not drop).

## What to test before what to measure

Priority order when adding tests to legacy code:

1. Money paths: billing, invoicing, payouts.
2. Irreversible actions: deletes, sends, publishes.
3. Security boundaries: authentication and authorization checks, input validation.
4. Everything else, newest code first.

## Exclusions

Generated code, dependency-injection registration files, and pure data-transfer objects are excluded from the metric via the shared coverage config. Do not write tests that only exercise the compiler.

## Flaky tests and coverage

A quarantined test does not count toward coverage. Fix or delete it within the quarantine deadline; letting coverage quietly erode is how floors become suggestions.

## Why

Floors per layer keep effort where it pays: exhaustive on the domain, pragmatic at the edges, and journey-focused end to end.
