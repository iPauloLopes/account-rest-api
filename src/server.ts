
import fastify from 'fastify'
import { knex } from './database'
import crypto from 'node:crypto'
import { env } from './env'

const app = fastify()

app.get('/test', async () => {
    const transaction = await knex('transactions').insert({
        id: crypto.randomUUID(),
        title: 'test transaction',
        amount: 1000
    }).returning('*')

    return transaction
})

app.get('/select', async () => {
    const selection = await knex('transactions').where('amount', 1000).select('*')

    return selection
})

app.listen({
    port: env.PORT
}).then(() => {
    console.log(`server running on port ${env.PORT}`)
})