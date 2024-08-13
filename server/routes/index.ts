import { randomUUID } from 'uncrypto'

export default eventHandler((event) => {
  return sendRedirect(event, 'dashboard')
})