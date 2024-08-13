import type { Kv } from '@deno/kv'

async function listTodos(kv: Kv) {
  const iter = await kv.list({ prefix: ['list'] }, { consistency: 'strong' })
  const todos = []
  for await (const todo of iter) todos.push(todo.value)

  todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return todos
}

export default eventHandler(async (event) => {
  const kv = await useKv()
  
  if (getHeader(event, 'accept') === 'text/event-stream') {
    setHeader(event, 'content-type', 'text/event-stream')
    const stream = kv.watch([['list_updated']]).getReader()
    const body = new ReadableStream({
      async start(controller) {
        while (true) {
          try {
            if ((await stream.read()).done) {
              return
            }

            const todos = await listTodos(kv)
            const chunk = `data: ${JSON.stringify(todos)}\n\n`
            controller.enqueue(new TextEncoder().encode(chunk))
          } catch (e) {
            console.error('Error refreshing list dash', e)
          }
        }
      },
      cancel() {
        stream.cancel()
      }
    })

    return sendStream(event, body)
  }

  return listTodos(kv)
})