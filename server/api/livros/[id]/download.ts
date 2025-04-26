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
        const livro = await prisma.livro.findUnique({
            where: { id }
        })

        if (!livro) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livro não encontrado'
            })
        }

        setHeader(event, 'Content-Type', 'application/epub+zip')

        return livro.conteudo
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao baixar livro'
        })
    }
})