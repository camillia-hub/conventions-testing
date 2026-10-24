# Test Naming and Structure

Tests are executable documentation. A failing test name should tell the reader what broke, under which conditions, and what was expected, without opening the file.

## Naming

Unit and integration tests use the pattern:

```
<MethodUnderTest>_<Scenario>_<ExpectedResult>
```

Examples:

```csharp
[Fact]
public void CalculateTotal_EmptyCart_ReturnsZero()

[Fact]
public void CalculateTotal_ItemWithDiscount_AppliesDiscountBeforeTax()

[Fact]
public void ParseHeader_MissingVersion_ThrowsFormatException()
```

End-to-end scenarios use Given/When/Then phrasing in the spec title:

```
checkout > applying an expired coupon > shows an inline error and keeps the cart
```

## Structure: Arrange, Act, Assert

Every test has three phases, separated by a blank line, in this order:

```csharp
[Fact]
public void Reserve_StockBelowRequested_ThrowsOutOfStock()
{
    // Arrange
    var warehouse = new WarehouseBuilder().WithStock("SKU-1", 2).Build();
    var order = Order.ForItems(("SKU-1", 5));

    // Act
    var act = () => warehouse.Reserve(order);

    // Assert
    act.Should().Throw<OutOfStockException>();
}
```

- Arrange: build inputs and collaborators; use builders for anything non-trivial.
- Act: exactly one call to the system under test.
- Assert: verify the observable outcome.

If a test needs two Act calls, it is two tests. If Arrange is longer than the rest of the test, extract a builder or a fixture.

## Comments

The `// Arrange` / `// Act` / `// Assert` comments are optional when the blank lines already make the phases obvious; they are required when a phase spans several helper calls.

## Why

Uniform names and phases let reviewers scan a test file top to bottom, and let failure reports from CI read like sentences instead of stack traces.
