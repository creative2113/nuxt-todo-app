import { z } from 'zod'

export default eventHandler(async (event) => {
  const { todoId } = await getValidatedRouterParams(event, z.object({
    todoId: z.string().length(36)
  }).parse)
  const kv = await useKv()
  const op = kv.atomic()
  op.delete(['list', todoId])
  op.set(['list_updated'], true)
  await op.commit()

  return { deleted: true }
})