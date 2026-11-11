import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { knex } from '../database.js';
import crypto from 'node:crypto'
import { z } from 'zod'

//preHandler function
async function checkSessionId(request: FastifyRequest, reply: FastifyReply) {
    const {sessionId} = request.cookies

    if (!sessionId) {
        return reply.status(401).send({error:'unauthorized user'})
    }
}

export async function transactionsRoutes (app:FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object ({
            title: z.string(),
            amount: z.number(),
            type: z.enum (['deposit','withdraw'])
        })

        const {title, amount, type} = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = crypto.randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
            })
        }

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'deposit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    app.get('/', {preHandler: checkSessionId}, async (request) => {
        const {sessionId} = request.cookies

        const transactions = await knex('transactions').where('session_id', sessionId).select('*')

        return {transactions}
    })

    app.get('/:id',{preHandler: checkSessionId}, async (request, reply) => {
        const {sessionId} = request.cookies
        
        const transactionParamsSchema = z.object ({
            id: z.string().uuid(),
        })

        const {id} = transactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()

        if (transaction.session_id !== sessionId) {
            return reply.status(401).send({error:'unauthorized user'})
        } else {
            return {transaction}
        }
    })

    app.get('/balance',{preHandler: checkSessionId} , async (request) => {
        const {sessionId} = request.cookies

        const balance = await knex('transactions').where('session_id', sessionId).sum('amount', {as: 'amount'}).first()

        return {balance}
    })
}