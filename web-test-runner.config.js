import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from "@web/test-runner-playwright";

// https://modern-web.dev/docs/test-runner/cli-and-configuration/#configuration-file

/** @type {import('@web/test-runner').TestRunnerConfig} */
const config = {
  plugins: [
    esbuildPlugin({ ts: true })
  ],
  files: [
    'tests/**/*.spec.ts'
  ],
  nodeResolve: true,
  concurrency: 1,
  concurrentBrowsers: 3,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' })
  ],
  coverage: true,
  coverageConfig: {
    include: [
      './src/**'
    ],
    exclude: [
      './src/**/index.ts'
    ],
    threshold: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config
