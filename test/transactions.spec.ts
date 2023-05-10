import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

// describe -> categorizar testes
describe('transactions routes', () => {
  // executar antes que todos os testes executem - apenas uma unica vez executada
  // para executar antes de cada test se usa o 'beforeEach' e depois 'after' e 'afterEach'
  beforeAll(async () => {
    // esperar meu app estar pronto antes de executar testes
    await app.ready()
  })

  afterAll(async () => {
    // fechar a aplicacao apos realizar testes
    await app.close()
  })

  beforeEach(() => {
    // desfazendo todas as migrations -> limpar banco
    execSync('npm run knex migrate:rollback --all')
    // rodar o banco dev antes de cada -> n tem tabela no banco de test
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    // fazer a chamada
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
      // validacao
      .expect(201)
  })
  it('should be able to list all transactions', async () => {
    // fazer a chamada
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponse.get('Set-cookie')
    // validacao
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({ title: 'new transaction', amount: 5000 }),
    ])
  })
  it('should be able to get a specific transaction', async () => {
    // fazer a chamada
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponse.get('Set-cookie')
    // validacao
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({ title: 'new transaction', amount: 5000 }),
    )
  })
  it('should be able to get the summary', async () => {
    // fazer a chamada
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'debit transaction',
        amount: 2000,
        type: 'debit',
      })
    // validacao
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
