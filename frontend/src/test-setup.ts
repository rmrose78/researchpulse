import { TextEncoder, TextDecoder } from 'node:util'

// jsdom doesn't implement these — react-router-dom references them at import time.
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
}
