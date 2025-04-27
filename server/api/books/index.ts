import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'

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
            const formData = await readMultipartFormData(event);
            if (!formData) throw new Error('Nenhum dado enviado');

            const name = formData.find(item => item.name === 'name')?.data?.toString();
            const serieId = parseInt(formData.find(item => item.name === 'serieId')?.data?.toString() || '');
            const markdownFiles = formData.filter(item => item.name === 'markdownFiles'); // Arquivos markdown
            const imageFiles = formData.filter(item => item.name === 'imageFiles'); // Imagens

            if (!name || !serieId || markdownFiles.length === 0 || imageFiles.length === 0) {
                throw new Error('Dados incompletos');
            }

            // Criar o livro
            const book = await prisma.book.create({
                data: {
                    name,
                    serieId,
                },
            });

            // Diretório para salvar as imagens
            const bookDirectory = path.join(process.cwd(), 'uploads', 'images', book.id.toString())

            // Criar o diretório, se não existir
            if (!existsSync(bookDirectory)) {
                mkdirSync(bookDirectory, { recursive: true })
            }

            // Processar imagens e salvar no diretório com o nome original
            imageFiles.forEach((file) => {
                const fileName = path.basename(file.filename || ''); // Obter o nome do arquivo
                const filePath = path.join(bookDirectory, fileName); // Caminho completo para salvar
                writeFileSync(filePath, file.data); // Salvar o arquivo
            });

            // Processar os arquivos markdown
            for (const file of markdownFiles) {
                const index = markdownFiles.indexOf(file);
                const fileContent = file.data.toString();

                // Substituir as URLs das imagens para o caminho correto
                const updatedContent = fileContent.replace(
                    /!\[.*?\]\(.*?\/images\/(.*?)\)/g,
                    (_, imageName) => `![${imageName}](/uploads/${book.id}/${imageName})`
                );

                // Criar páginas para o livro
                await prisma.page.create({
                    data: {
                        bookId: book.id,
                        title: file.filename ?? `Página ${index + 1}`,
                        content: updatedContent,
                        index: index + 1,
                    },
                });
            }

            return {
                status: 'success',
                bookId: book.id,
            };

        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: error.message || 'Erro ao criar o livro',
            });
        }
    }
})