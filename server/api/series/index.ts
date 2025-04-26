import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // GET /api/series
    if (event.method === 'GET') {
        try {
            const series = await prisma.serie.findMany({
                include: {
                    livros: {
                        select: {
                            id: true,
                            nome: true,
                            createdAt: true
                        }
                    }
                }
            })
            return series
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao buscar séries'
            })
        }
    }

    // POST /api/series
    if (event.method === 'POST') {
        try {
            const body = await readBody(event)
            const serie = await prisma.serie.create({
                data: {
                    titulo: body.titulo,
                    autor: body.autor
                }
            })
            return serie
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao criar série'
            })
        }
    }
})