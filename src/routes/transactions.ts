import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIsExist } from "../middlewares/check-session-id-exists";

// Cookies <--> Formas da gente manter contextos entre requisições





// TODO PLUGIN (transactionsRoutes é um plugin) É NECESSÁRIO SER ASSINCRÔNA (Async)
export async function transactionsRoutes(app: FastifyInstance) {

    // Contexto global
    app.addHook('preHandler', async (req, res) => {
        console.log(`${req.method}`)
    })

    // preHandler é um middleware que vai fazer uma verificação se o sessionId existe.

    app.get('/', {preHandler: [checkSessionIsExist]} ,async (req, res) => {
        const sessionId = req.cookies.sessionId


        const transactions = await knex('transactions')
        .where("session_id", sessionId)
        .select('*') 
        
        // Retornando um objeto com um Array dentro
        return { transactions }
    }),

    app.get('/:id', {preHandler: [checkSessionIsExist]} , async (req, res) => {

        const sessionId = req.cookies.sessionId

        // Fazendo validação para saber se estamos recebendo um uuid
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        // desestruturando e fazendo verificação se o schema está contendo o id.
        const { id } = getTransactionParamsSchema.parse(req.params)

        const transactions = await knex('transactions').where(
            {
                session_id: sessionId,
                id
            }
        ).first()

        return res.status(200).send(transactions)
    })

    app.get('/summary', {preHandler: [checkSessionIsExist]} , async(req, res) => {
        // o Sum vai somar todos os valores de uma colona declarada ("AMOUNT")
        // O Segundo parametro dentro de SUM é para dar um nome a coluna que será exibida na soma.

        const sessionId = req.cookies.sessionId

        const summary = await knex('transactions').sum('amount', { as: 'amount' })
        .where('session_id', sessionId)
        .first()

        return res.status(200).send(summary)
    })


    app.post("/", async (req, res) => {

        // Schema criado para verificar o body da requisião tem esses dados.
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        // Se tiver tudo ok será passado para a const body se não o própio zod vai apresentar o erro.
        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            // Setando um cookie dentro do navegador chamado sessionId com o valor de sessionId
            res.cookie('sessionId', sessionId, {
                path: '/', // Onde ele será encontrado
                maxAge: 1000 * 60 * 60 * 24 * 7 // Setando após quantos dias será expirado. Você pode usar o expire onde pode colocar a data exata.
            })
        }

        // Adicionando na tabela de transactions
        await knex('transactions')
            .insert({
                id: crypto.randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,
                session_id: sessionId
        })
        res.status(201).send()

    });

}


