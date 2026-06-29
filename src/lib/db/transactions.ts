import { prisma } from './prisma'

export async function runTransaction<T>(
  callback: (tx: typeof prisma) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    return callback(tx as typeof prisma)
  })
}
