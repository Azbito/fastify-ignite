import fastify from 'fastify'
import { env } from './env'
import { transactionsRouter } from './routes/transactions'

const app = fastify()

// GET, POST, PUT, PATCH, DELETE
app.register(transactionsRouter, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
