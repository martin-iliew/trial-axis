import { test, expect } from '@playwright/test'
import path from 'path'

const CRO_STORAGE = path.join(__dirname, '..', '.auth', 'cro.json')

/**
 * CRO flow tests. These require a logged-in CRO user.
 * Set E2E_CRO_EMAIL and E2E_CRO_PASSWORD env vars and run
 * the auth setup first. Skip if no credentials are provided.
 */
test.describe('CRO flow', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CRO_EMAIL) {
      test.skip()
    }
  })

  test.use({ storageState: CRO_STORAGE })

  test('projects page loads and shows heading', async ({ page }) => {
    await page.goto('/cro/projects')
    await expect(page.getByText('CRO Study Portfolio')).toBeVisible()
  })

  test('projects page has "New Study" button', async ({ page }) => {
    await page.goto('/cro/projects')
    const btn = page.getByRole('link', { name: 'New Study' })
    await expect(btn).toBeVisible()
  })

  test('navigates to new project form', async ({ page }) => {
    await page.goto('/cro/projects')
    await page.getByRole('link', { name: 'New Study' }).click()
    await page.waitForURL('/cro/projects/new')
  })

  test('new project form renders required fields', async ({ page }) => {
    await page.goto('/cro/projects/new')
    await expect(page.getByLabel('Title')).toBeVisible()
  })

  test('shows empty state when no projects exist', async ({ page }) => {
    await page.goto('/cro/projects')
    // Either shows projects or the empty state — both are valid
    const hasProjects = await page.locator('a[href^="/cro/projects/"]').count()
    if (hasProjects === 0) {
      await expect(page.getByText('No projects yet')).toBeVisible()
    }
  })
})
