import { randomUUID } from "crypto";
import fastify from "fastify";
import cookie from '@fastify/cookie'
import { transactionsRoutes } from "./routes/transactions";

export const app = fastify();

// Adicionado plugin de cookie antes de usar ele
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions'
})
