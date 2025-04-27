import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    if (event.method === 'DELETE') {
        try {
            const id = Number(event.context.params?.id)

            await prisma.book.delete({
                where: {
                    id: id
                }
            })

            return {status: 'success'}
        } catch (error) {
            console.error(error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao deletar book'
            })
        }
    }
})