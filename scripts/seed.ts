
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

const unidades = [
  { nome: 'THE BARBER Shopping Metrópole', endereco: 'Shopping Metrópole' },
  { nome: 'THE BARBER Shopping Paralela', endereco: 'Shopping Paralela' },
  { nome: 'THE BARBER Shopping da Bahia', endereco: 'Shopping da Bahia' },
  { nome: 'THE BARBER Shopping Barra', endereco: 'Shopping Barra' },
  { nome: 'THE BARBER Shopping Salvador', endereco: 'Shopping Salvador' },
  { nome: 'THE BARBER Shopping Piedade', endereco: 'Shopping Piedade' },
  { nome: 'THE BARBER Shopping Itaigara', endereco: 'Shopping Itaigara' },
  { nome: 'THE BARBER Shopping Boulevard', endereco: 'Shopping Boulevard' },
  { nome: 'THE BARBER Shopping Centro', endereco: 'Shopping Centro' },
  { nome: 'THE BARBER Shopping Cajazeiras', endereco: 'Shopping Cajazeiras' },
  { nome: 'THE BARBER Shopping Brotas', endereco: 'Shopping Brotas' },
  { nome: 'THE BARBER Shopping Pituba', endereco: 'Shopping Pituba' },
  { nome: 'THE BARBER Shopping Caminho das Árvores', endereco: 'Shopping Caminho das Árvores' },
  { nome: 'THE BARBER Shopping Camaçari', endereco: 'Shopping Camaçari' },
  { nome: 'THE BARBER Shopping Lauro de Freitas', endereco: 'Shopping Lauro de Freitas' },
  { nome: 'THE BARBER Shopping Feira de Santana', endereco: 'Shopping Feira de Santana' },
  { nome: 'THE BARBER Shopping Vitória da Conquista', endereco: 'Shopping Vitória da Conquista' }
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar as 17 unidades
  for (const unidade of unidades) {
    await prisma.unidade.upsert({
      where: { nome: unidade.nome },
      update: {},
      create: unidade,
    })
  }

  // Criar usuário admin (para testes)
  const hashedPasswordTest = await bcryptjs.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@thebarber.com' },
    update: {
      password: hashedPasswordTest,
      role: 'ADMIN',
      name: 'Administrador'
    },
    create: {
      email: 'admin@thebarber.com',
      password: hashedPasswordTest,
      role: 'ADMIN',
      name: 'Administrador'
    }
  })

  // Criar usuário admin (Luan)
  const hashedPassword = await bcryptjs.hash('Luan2025', 10)
  await prisma.user.upsert({
    where: { email: 'luanmca1@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Luan'
    },
    create: {
      email: 'luanmca1@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Luan'
    }
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log(`📍 ${unidades.length} unidades criadas`)
  console.log('👤 Usuário admin (teste) criado: admin@thebarber.com')
  console.log('👤 Usuário admin (Luan) criado: luanmca1@gmail.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
