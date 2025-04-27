import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // DELETE /api/translates/[wordId]/[translateId]
    if (event.method === 'DELETE') {
        if (!translateId) {
            throw createError({
                statusCode: 400,
                message: 'ID da tradução é obrigatório'
            })
        }

        try {
            await prisma.translate.delete({
                where: { id: parseInt(translateId) }
            })
            return { message: 'Tradução excluída com sucesso' }
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao excluir tradução'
            })
        }
    }
})