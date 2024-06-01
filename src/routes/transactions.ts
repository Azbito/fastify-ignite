import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function transactionsRouter(app: FastifyInstance) {
  // eslint-disable-next-line
  app.get('/', async (request, reply) => {
    const transactions = await knex('transactions').select()

    return {
      transactions,
    }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return { summary }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()
    return transaction
  })

  app.post('/', async (request, reply) => {
    // eslint-disable-next-line
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      const TIME = 60 * 60 * 24 * 7 // 7 DAYS

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: TIME,
      })
    }

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
