// e2e/rbac-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('RBAC Generation Flow', () => {
  test('should generate a valid Role and RoleBinding', async ({ page }) => {
    await page.goto('/');

    // Fill in role name
    await page.fill('input[placeholder="my-role"]', 'test-role');

    // Fill in binding name
    await page.fill('input[placeholder="my-role-binding"]', 'test-binding');

    // Select namespace scope
    await page.click('text=Namespace-scoped (Role)');

    // Add a resource
    await page.selectOption('select', 'pods');
    await page.click('button:has-text("Add")');

    // Select verbs
    await page.check('input[type="checkbox"][value="get"]');
    await page.check('input[type="checkbox"][value="list"]');

    // Add a subject
    await page.fill('input[placeholder="user-name"]', 'test-user');
    await page.click('button:has-text("Add Subject")');

    // Generate YAML
    await page.click('button:has-text("Download YAML")');

    // Verify YAML preview contains expected content
    const yamlContent = await page.textContent('.yaml-preview');
    expect(yamlContent).toContain('kind: Role');
    expect(yamlContent).toContain('name: test-role');
    expect(yamlContent).toContain('kind: RoleBinding');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/');

    // Try to download without filling required fields
    await page.click('button:has-text("Download YAML")');

    // Should show validation errors
    await expect(page.locator('text=Role name is required')).toBeVisible();
  });
});
