import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // POST /api/words
    if (event.method === 'POST') {
        const body = await readBody(event)
        try {
            // Verificar se já existe uma word com o term fornecido
            const existingPalavra = await prisma.word.findUnique({
                where: {
                    term: body.term
                }
            })

            // Se a word já existir, retornamos a word existente
            if (existingPalavra) {
                // Verificar se a tradução já existe
                const existingtranslate = await prisma.translate.findFirst({
                    where: {
                        wordId: existingPalavra.id,
                        translate: body.translate
                    }
                })

                if (existingtranslate) {
                    return { message: 'Tradução já existe para esta word' }
                }

                // Criar nova tradução para a word existente
                const novatranslate = await prisma.translate.create({
                    data: {
                        translate: body.translate,
                        wordId: existingPalavra.id
                    }
                })

                return { word: existingPalavra, translate: novatranslate }
            }

            // Criar nova word com tradução
            const word = await prisma.word.create({
                data: {
                    term: body.term,
                    translates: {
                        create: {
                            translate: body.translate
                        }
                    }
                }
            })

            return word
        } catch (error) {
            console.error(error)
            throw createError({
                statusCode: 500,
                message: 'Erro ao criar word e tradução'
            })
        }

    }

    // GET /api/words
    if (event.method === 'GET') {
        try {
            // Buscar words que possuem pelo menos uma tradução associada
            const words =  await prisma.word.findMany({
                where: {
                    translates: {
                        some: {} // Filtra words que possuem traduções associadas
                    }
                },
                select: {
                    term: true,
                    translates: {
                        select: {
                            translate: true,
                        }
                    }
                }
            })
            words.map((word) => {
                return { term: word.term, translates: word.translates.map(translate => translate.translate) }
            })
            return words
        } catch (error) {
            console.log(error)
            throw createError({
                statusCode: 500,
                message: 'Erro ao buscar words'
            })
        }
    }
})
