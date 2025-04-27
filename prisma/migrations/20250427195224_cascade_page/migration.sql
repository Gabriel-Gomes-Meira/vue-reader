-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_bookId_fkey";

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
