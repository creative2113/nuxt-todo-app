import { z } from 'zod'

export default eventHandler(async (event) => {
  const { todoId } = await getValidatedRouterParams(event, z.object({
    todoId: z.string().length(36)
  }).parse)
  const kv = await useKv()

  const todo = await kv.get(['list', todoId])
  if (!todo.value) {
    throw createError({
      statusCode: 404,
      message: 'Todo not found'
    })
  }

  return todo
})