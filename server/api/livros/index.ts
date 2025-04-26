import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // GET /api/livros
    if (event.method === 'GET') {
        try {
            const query = getQuery(event)
            const serieId = query.serieId ? parseInt(query.serieId as string) : undefined

            const livros = await prisma.livro.findMany({
                where: serieId ? {
                    serieId
                } : undefined,
                include: {
                    serie: {
                        select: {
                            titulo: true,
                            autor: true
                        }
                    }
                }
            })
            return livros.map(livro => ({
                ...livro,
                conteudo: undefined // Não enviamos o conteúdo na listagem
            }))
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao buscar livros'
            })
        }
    }

    // POST /api/livros
    if (event.method === 'POST') {
        try {
            const formData = await readMultipartFormData(event)
            if (!formData) throw new Error('Nenhum dado enviado')

            const nome = formData.find(item => item.name === 'nome')?.data?.toString()
            const serieId = parseInt(formData.find(item => item.name === 'serieId')?.data?.toString() || '')
            const epubFile = formData.find(item => item.name === 'epub')

            if (!nome || !serieId || !epubFile) {
                throw new Error('Dados incompletos')
            }

            const livro = await prisma.livro.create({
                data: {
                    nome,
                    serieId,
                    conteudo: epubFile.data
                }
            })

            return {
                id: livro.id,
                nome: livro.nome,
                serieId: livro.serieId,
                createdAt: livro.createdAt
            }
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message || 'Erro ao criar livro'
            })
        }
    }
})