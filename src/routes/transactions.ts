import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import crypto from 'node:crypto'
import { z } from 'zod'

export async function transactionsRoutes (app:FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object ({
            title: z.string(),
            amount: z.number(),
            type: z.enum (['deposit','withdraw'])
        })

        const {title, amount, type} = createTransactionBodySchema.parse(request.body)

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'deposit' ? amount : amount * -1,
        })

        return reply.status(201).send()
    })

    app.get('/', async () => {
        const transactions = await knex('transactions').select('*')

        return {
            transactions
        }
    })

    app.get('/:id', async (request) => {
        const transactionParamsSchema = z.object ({
            id: z.string().uuid()
        })

        const {id} = transactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()

        return {
            transaction
        }
    })

    app.get('/balance', async (request) => {
        const balance = await knex('transactions').sum('amount', {as: 'amount'}).first()

        return {balance}
    })
}