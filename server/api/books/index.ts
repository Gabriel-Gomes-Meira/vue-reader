import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // GET /api/books
    if (event.method === 'GET') {
        try {
            const query = getQuery(event)
            const serieId = query.serieId ? parseInt(query.serieId as string) : undefined

            const books = await prisma.book.findMany({
                where: serieId ? {
                    serieId
                } : undefined,
                include: {
                    serie: {
                        select: {
                            title: true,
                            author: true
                        }
                    }
                }
            })
            return books.map(book => ({
                ...book,
                content: undefined // Não enviamos o conteúdo na listagem
            }))
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao buscar books'
            })
        }
    }

    // POST /api/books
    if (event.method === 'POST') {
        try {
            const formData = await readMultipartFormData(event)
            if (!formData) throw new Error('Nenhum dado enviado')

            const name = formData.find(item => item.name === 'name')?.data?.toString()
            const serieId = parseInt(formData.find(item => item.name === 'serieId')?.data?.toString() || '')
            const epubFile = formData.find(item => item.name === 'epub')

            if (!name || !serieId || !epubFile) {
                throw new Error('Dados incompletos')
            }

            const book = await prisma.book.create({
                data: {
                    name,
                    serieId,
                    content: epubFile.data
                }
            })

            return {
                id: book.id,
                name: book.name,
                serieId: book.serieId,
                createdAt: book.createdAt
            }
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message || 'Erro ao criar book'
            })
        }
    }
})