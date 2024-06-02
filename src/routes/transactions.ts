import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionExists } from '../middlewares/check-session-id-exist'

export async function transactionsRouter(app: FastifyInstance) {
  // eslint-disable-next-line
  app.get(
    '/',
    {
      preHandler: [checkSessionExists],
    },
    // eslint-disable-next-line
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return {
        transactions,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { sessionId } = request.cookies
      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      return transaction
    },
  )

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
