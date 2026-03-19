import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options for the CORS middleware.
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
