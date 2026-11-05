import { expect, test, beforeAll, afterAll, describe } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'

beforeAll ( async () => {
    await app.ready()
})

afterAll ( async () => {
    await app.close()
})

describe ('Transaction routes', () => {
    test ('create new transaction', async () => {
        await supertest(app.server).post('/transactions').send({
            title: 'Test transaction',
            amount: 100,
            type: 'deposit'
        }).expect(201)
    })
})


