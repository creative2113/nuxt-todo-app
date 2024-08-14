import { randomUUID } from 'uncrypto'
import { z } from 'zod'

export default eventHandler(async (event) => {
  const todo = await readValidatedBody(event, z.object({
    id: z.string().optional().default(() => randomUUID()),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    completed: z.boolean().default(false),
    createdAt: z.string().default(Date),
    updatedAt: z.string().default(Date),
  }).parse)

  const kv = await useKv()
  const op = kv.atomic()
  op.set(['list', todo.id], todo)
  op.set(['list_updated'], true)
  await op.commit()
  return todo
})