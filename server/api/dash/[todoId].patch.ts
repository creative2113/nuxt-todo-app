import { z } from 'zod'

export default eventHandler(async (event) => {
  const { todoId } = await getValidatedRouterParams(event, z.object({
    todoId: z.string().length(36)
  }).parse)
  const updateTodo = await readValidatedBody(event, z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1)
  }).parse)
  const kv = await useKv()

  const todo = await kv.get(['list', todoId])
  if (!todo.value) {
    throw createError({
      statusCode: 404,
      message: 'Todo not found'
    })
  }

  const op = kv.atomic()
  op.set(['list', todoId], {
    ...todo.value,
    updatedAt: new Date(),
    ...updateTodo
  })
  op.set(['list_updated'], true)
  await op.commit()

  return { updated: true }
})