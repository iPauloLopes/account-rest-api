import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import crypto from 'node:crypto'

export async function transactionsRoutes (app:FastifyInstance) {
    app.get('/test', async () => {
        const transaction = await knex('transactions').insert({
            id: crypto.randomUUID(),
            title: 'test transaction',
            amount: 1000
        }).returning('*')
    
        return transaction
    })
}