import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID inválido'
        })
    }

    try {
        const book = await prisma.book.findUnique({
            where: { id }
        })

        if (!book) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livro não encontrado'
            })
        }

        setHeader(event, 'Content-Type', 'application/epub+zip')

        return book.content
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao baixar book'
        })
    }
})