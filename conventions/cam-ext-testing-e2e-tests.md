# End-to-End Test Conventions

End-to-end tests drive the real application through its UI against a deployed environment. They are the fewest and most valuable tests: each one guards a user journey that would cost revenue or trust if it broke.

## Scope

E2E covers journeys, not features: sign-up, checkout, invite-a-teammate. Field-level validation and edge cases belong in unit and integration tests. A healthy E2E suite is tens of specs, not hundreds.

## Page objects

All selectors and page interactions live in page objects under `e2e/pages/`. Specs express intent; page objects express mechanics.

```typescript
// e2e/pages/CheckoutPage.ts
export class CheckoutPage {
  constructor(private page: Page) {}

  async applyCoupon(code: string) {
    await this.page.getByLabel('Coupon code').fill(code);
    await this.page.getByRole('button', { name: 'Apply' }).click();
  }

  async total(): Promise<string> {
    return this.page.getByTestId('order-total').innerText();
  }
}
```

```typescript
// e2e/specs/checkout.spec.ts
test('applying an expired coupon shows an inline error', async ({ page }) => {
  const checkout = await CheckoutPage.open(page, cartWithOneItem);
  await checkout.applyCoupon('EXPIRED-2024');
  await expect(page.getByRole('alert')).toHaveText('This coupon has expired');
});
```

## Selector policy

Prefer role and label queries, then `data-testid`. Never select on CSS classes, XPath, or DOM position: those break on redesigns that keep behavior intact.

## Data and isolation

- Each spec creates its own account or tenant via the setup API; specs never share credentials or carts.
- Clean up through the API in an `afterEach`; a failed test must not poison the next run.
- Quarantine, do not delete: a flaky spec moves to the `quarantine` project with a linked issue and a two-week fix deadline.

## Why

E2E tests are expensive to write and run; page objects and strict data isolation keep that cost from compounding into a suite nobody trusts.
