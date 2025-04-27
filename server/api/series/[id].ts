import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID é obrigatório'
        })
    }

    if (event.method === 'PUT') {
        const body = await readBody(event)
        try {
            const serie = await prisma.serie.update({
                where: {id: parseInt(id)},
                data: {
                    title: body.title,
                    author: body.author
                }
            })
            return serie
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao atualizar série'
            })
        }
    }

    if (event.method === 'DELETE') {
        try {
            await prisma.serie.delete({
                where: {id: parseInt(id)}
            })
            return {message: 'Série excluída com sucesso'}
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Erro ao excluir série'
            })
        }
    }
})