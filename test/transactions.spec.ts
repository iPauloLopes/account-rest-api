import { expect, test, beforeAll, afterAll, beforeEach, afterEach, describe } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

beforeAll ( async () => {
    await app.ready()
})

afterAll ( async () => {
    await app.close()
})

beforeEach (async () => {
    execSync('npm run knex migrate:latest')
})

afterEach (async () => {
    execSync('npm run knex migrate:rollback --all')
})


describe ('Transaction routes', () => {
    test ('create new transaction', async () => {
        await supertest(app.server).post('/transactions').send({
            title: 'Test transaction',
            amount: 100,
            type: 'deposit'
        }).expect(201)
    })

    test ('list transactions', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'Test transaction',
            amount: 100,
            type: 'deposit'
        })
        
        const cookies = createTransactionResponse.get('Set-Cookie')! // This ! is here so TS can understand Cookie is not undefined

        const listTransactionResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies).expect(200)

        expect(listTransactionResponse.body.transactions).toEqual([
            expect.objectContaining ({
                title: 'Test transaction',
                amount: 100
            })
        ])
    })

    test ('search transaction by id', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'Test transaction',
            amount: 100,
            type: 'deposit'
        })
        
        const cookies = createTransactionResponse.get('Set-Cookie')! // This ! is here so TS can understand Cookie is not undefined

        const listTransactionResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies).expect(200)

        const transactionId = listTransactionResponse.body.transactions[0].id

        const getTransactionResponse = await supertest(app.server).get(`/transactions/${transactionId}`).set('Cookie', cookies).expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining ({
                title: 'Test transaction',
                amount: 100
            })
        )
    })

    test.only ('check account balance', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'Test transaction',
            amount: 100,
            type: 'deposit'
        })
        
        const cookies = createTransactionResponse.get('Set-Cookie')! // This ! is here so TS can understand Cookie is not undefined

        await supertest(app.server).post('/transactions').set('Cookie', cookies).send({
            title: 'Test transaction 2',
            amount: 50,
            type: 'withdraw'
        })

        const getBalance = await supertest(app.server).get('/transactions/balance').set('Cookie', cookies).expect(200)

        expect(getBalance.body.balance).toEqual({amount: 50})
    })
})