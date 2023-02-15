import { FastifyReply, FastifyRequest } from "fastify"

export async function checkSessionIsExist(req: FastifyRequest, res: FastifyReply){
        const sessionId = req.cookies.sessionId

        if(!sessionId){
            return res.status(401).send({
                error: "Não autorizado"
            })
        }
}