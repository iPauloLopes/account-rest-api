import { FastifyInstance } from 'fastify';
import { knex } from '../database';

export async function selectTransactions (app:FastifyInstance) {
    app.get('/select', async () => {
        const selection = await knex('transactions').where('amount', 1000).select('*')

        return selection
    })
} 