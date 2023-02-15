import { randomUUID } from "crypto";
import fastify from "fastify";
import cookie from '@fastify/cookie'
import { env } from './env/index'
import { knex } from "./database";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

// Adicionado plugin de cookie antes de usar ele
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions'
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running.");
  });
