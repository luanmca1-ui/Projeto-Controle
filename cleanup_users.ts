import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Deletar todos os usuários exceto o Luan
  const result = await prisma.user.deleteMany({
    where: {
      email: {
        not: 'luanmca1@gmail.com'
      }
    }
  })
  console.log(`✅ ${result.count} usuários deletados`)
}

main().finally(() => prisma.$disconnect())
