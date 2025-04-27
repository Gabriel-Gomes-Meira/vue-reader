import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID é obrigatório'
        })
    }

    // GET /api/words/[id]
    if (event.method === 'GET') {
        try {
            const word = await prisma.word.findUnique({
                where: { id: parseInt(id) },
                include: {
                    translates: true // Inclui as traduções relacionadas
                }
            })
            if (!word) {
                throw createError({
                    statusCode: 404,
                    message: 'Palavra não encontrada'
                })
            }
            return word
        } catch (error) {
            console.log(error)
            throw createError({
                statusCode: 500,
                message: 'Erro ao buscar word'
            })
        }
    }

    // PUT /api/words/[id]
    if (event.method === 'PUT') {
        const body = await readBody(event)
        try {
            const word = await prisma.word.update({
                where: { id: parseInt(id) },
                data: {
                    term: body.term
                }
            })
            return word
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao atualizar word'
            })
        }
    }

    // DELETE /api/words/[id]
    if (event.method === 'DELETE') {
        try {
            await prisma.word.delete({
                where: { id: parseInt(id) }
            })
            return { message: 'Palavra excluída com sucesso' }
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao excluir word'
            })
        }
    }
})
