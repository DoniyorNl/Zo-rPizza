import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	webServer: {
		command: 'cd ../frontend && NEXT_PUBLIC_E2E_BYPASS_AUTH=true pnpm dev',
		port: 3000,
		reuseExistingServer: true,
	},
	use: {
		baseURL: 'http://localhost:3000',
	},
})
