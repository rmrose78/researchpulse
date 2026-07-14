/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest-axe" />

// @jest/expect re-exports `Matchers` from `expect` instead of declaring it locally,
// so augmenting '@jest/expect' (what jest-dom's own /jest-globals typings do) never
// merges. Augmenting the origin module directly is the only way that works with
// `import { expect } from '@jest/globals'` in Jest 30.
declare module 'expect' {
  interface Matchers<R extends void | Promise<void>, T = unknown>
    extends import('@testing-library/jest-dom/matchers').TestingLibraryMatchers<T, R> {}
}
