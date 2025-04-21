import { test, expect } from '@playwright/test';

test.describe('Contact Page Tests', () => {

  test('Test Case 1: Error validation and field correction', async ({ page }) => {
    await page.goto('https://jupiter.cloud.planittesting.com');
    await page.click('text=Contact');

    await page.click('text=Submit');

    await expect(page.locator('#forename-err')).toHaveText('Forename is required');
    await expect(page.locator('#email-err')).toHaveText('Email is required');
    await expect(page.locator('#message-err')).toHaveText('Message is required');

    await page.fill('#forename', 'Alice');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#message', 'Hello, this is a test message.');

    await expect(page.locator('#forename-err')).toBeHidden();
    await expect(page.locator('#email-err')).toBeHidden();
    await expect(page.locator('#message-err')).toBeHidden();
  });

  test.describe('Test Case 2: Successful form submission - run 5 times', () => {
    for (let i = 1; i <= 5; i++) {
      test(`Run #${i}`, async ({ page }) => {
        await page.goto('https://jupiter.cloud.planittesting.com');
        await page.click('text=Contact');

        await page.fill('#forename', 'Alice');
        await page.fill('#email', 'alice@example.com');
        await page.fill('#message', 'Great service!');

        await page.click('text=Submit');

        const successAlert = page.locator('.alert-success');
        await successAlert.waitFor({ state: 'visible', timeout: 50000 });
        await expect(successAlert).toHaveText(/Thanks Alice, we appreciate your feedback./);
      });
    }
  });

  test('Test Case 3: Shopping cart validation', async ({ page }) => {
    await page.goto('https://jupiter.cloud.planittesting.com/#/shop', { waitUntil: 'domcontentloaded' });

    const addToCart = async (productName: string, quantity: number) => {
      await page.waitForSelector('li.product', { timeout: 10000 });

      const productRow = page.locator(`li.product:has(h4:has-text("${productName}"))`);
      await expect(productRow).toBeVisible();

      const buyButton = productRow.locator('text=Buy');
      await expect(buyButton).toBeVisible();

      for (let i = 0; i < quantity; i++) {
        await buyButton.click();
      }
    };

    await addToCart('Stuffed Frog', 2);
    await addToCart('Fluffy Bunny', 5);
    await addToCart('Valentine Bear', 3);

    await page.click('text=Cart');

    const getQuantity = async (productName: string) => {
      const row = page.locator(`tr:has-text("${productName}")`);
      await expect(row).toBeVisible();

      // Quantity is inside an <input>, not just plain text
      const quantityInput = row.locator('input[type="number"]');
      const quantityValue = await quantityInput.inputValue();

      const quantity = Number(quantityValue);
      if (isNaN(quantity)) {
        throw new Error(`Quantity is not a number for product: ${productName}. Got: "${quantityValue}"`);
      }
      return quantity;
    };

    expect(await getQuantity('Stuffed Frog')).toBe(2);
    expect(await getQuantity('Fluffy Bunny')).toBe(5);
    expect(await getQuantity('Valentine Bear')).toBe(3);
  });

});