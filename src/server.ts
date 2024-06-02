import fastify from 'fastify'
import { env } from './env'
import { transactionsRouter } from './routes/transactions'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)

// If we need to use hooks, in order to not have to repeat the same hook over and over again, we can use addHook to do so
// app.addHook('preHandler', async (request, reply) => {
//   console.log(`[${request.method}] ${reply.url}`)
// })

app.register(transactionsRouter, {
  prefix: '/transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
