import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const wordId = event.context.params?.wordId

    if (!wordId) {
        throw createError({
            statusCode: 400,
            message: 'ID da word é obrigatório'
        })
    }

    // GET /api/words/translate/[wordId]
    if (event.method === 'GET') {
        try {
            return await prisma.translate.findMany({
                where: {wordId: parseInt(wordId)}
            })
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao buscar traduções'
            })
        }
    }
})
