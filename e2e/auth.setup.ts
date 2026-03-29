import { test as setup, expect } from '@playwright/test'
import path from 'path'

const CRO_STORAGE = path.join(__dirname, '..', '.auth', 'cro.json')
const CLINIC_STORAGE = path.join(__dirname, '..', '.auth', 'clinic.json')

/**
 * These setup tests authenticate as CRO and clinic users and save
 * their storage state so downstream tests can reuse them without logging
 * in each time.
 *
 * Set the following env vars (or add them to .env.test):
 *   E2E_CRO_EMAIL / E2E_CRO_PASSWORD
 *   E2E_CLINIC_EMAIL  / E2E_CLINIC_PASSWORD
 */

setup('authenticate as CRO', async ({ page }) => {
  const email = process.env.E2E_CRO_EMAIL
  const password = process.env.E2E_CRO_PASSWORD

  if (!email || !password) {
    setup.skip()
    return
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/cro/projects')

  await page.context().storageState({ path: CRO_STORAGE })
})

setup('authenticate as clinic admin', async ({ page }) => {
  const email = process.env.E2E_CLINIC_EMAIL
  const password = process.env.E2E_CLINIC_PASSWORD

  if (!email || !password) {
    setup.skip()
    return
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/clinic/profile')

  await page.context().storageState({ path: CLINIC_STORAGE })
})
