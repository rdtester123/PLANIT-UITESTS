import { test, expect } from '@playwright/test';

// Grouping all Contact Page related tests
test.describe('Contact Page Tests', () => {

  // Test Case 1: Validate error messages appear when submitting empty form,
  // then confirm they disappear after fields are correctly filled
  test('Test Case 1: Error validation and field correction', async ({ page }) => {
    await page.goto('https://jupiter.cloud.planittesting.com');
    await page.click('text=Contact');

    // Submit the form with empty fields
    await page.click('text=Submit');

    // Assert all error messages are visible
    await expect(page.locator('#forename-err')).toHaveText('Forename is required');
    await expect(page.locator('#email-err')).toHaveText('Email is required');
    await expect(page.locator('#message-err')).toHaveText('Message is required');

    // Fill the form with valid values
    await page.fill('#forename', 'Alice');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#message', 'Hello, this is a test message.');

    // Assert error messages are now hidden
    await expect(page.locator('#forename-err')).toBeHidden();
    await expect(page.locator('#email-err')).toBeHidden();
    await expect(page.locator('#message-err')).toBeHidden();
  });

  // Test Case 2: Successfully submit the contact form multiple times
  test.describe('Test Case 2: Successful form submission - run 5 times', () => {
    for (let i = 1; i <= 5; i++) {
      test(`Run #${i}`, async ({ page }) => {
        await page.goto('https://jupiter.cloud.planittesting.com');
        await page.click('text=Contact');

        // Fill out and submit the contact form
        await page.fill('#forename', 'Alice');
        await page.fill('#email', 'alice@example.com');
        await page.fill('#message', 'Great service!');
        await page.click('text=Submit');

        // Wait for the success alert to appear and verify the message
        const successAlert = page.locator('.alert-success');
        await successAlert.waitFor({ state: 'visible', timeout: 50000 });
        await expect(successAlert).toHaveText(/Thanks Alice, we appreciate your feedback./);
      });
    }
  });

  // Test Case 3: Add items to cart and validate their quantities
  test('Test Case 3: Shopping cart validation', async ({ page }) => {
    await page.goto('https://jupiter.cloud.planittesting.com/#/shop', { waitUntil: 'domcontentloaded' });

    // Helper function to add a product to cart multiple times
    const addToCart = async (productName: string, quantity: number) => {
      await page.waitForSelector('li.product', { timeout: 10000 });

      // Locate the product by name
      const productRow = page.locator(`li.product:has(h4:has-text("${productName}"))`);
      await expect(productRow).toBeVisible();

      const buyButton = productRow.locator('text=Buy');
      await expect(buyButton).toBeVisible();

      // Click "Buy" button the specified number of times
      for (let i = 0; i < quantity; i++) {
        await buyButton.click();
      }
    };

    // Add different quantities of each product
    await addToCart('Stuffed Frog', 2);
    await addToCart('Fluffy Bunny', 5);
    await addToCart('Valentine Bear', 3);

    // Navigate to cart
    await page.click('text=Cart');

    // Helper function to get quantity value from the input field
    const getQuantity = async (productName: string) => {
      const row = page.locator(`tr:has-text("${productName}")`);
      await expect(row).toBeVisible();

      const quantityInput = row.locator('input[type="number"]');
      const quantityValue = await quantityInput.inputValue();

      const quantity = Number(quantityValue);
      if (isNaN(quantity)) {
        throw new Error(`Quantity is not a number for product: ${productName}. Got: "${quantityValue}"`);
      }
      return quantity;
    };

    // Verify the quantities match expected values
    expect(await getQuantity('Stuffed Frog')).toBe(2);
    expect(await getQuantity('Fluffy Bunny')).toBe(5);
    expect(await getQuantity('Valentine Bear')).toBe(3);
  });

});