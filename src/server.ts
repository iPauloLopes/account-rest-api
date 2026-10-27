import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import { selectTransactions } from './routes/select-transactions'

const app = fastify()

app.register(transactionsRoutes, {
    prefix: 'transactions'
})
app.register(selectTransactions)

app.listen({
    port: env.PORT
}).then(() => {
    console.log(`server running on port ${env.PORT}`)
})