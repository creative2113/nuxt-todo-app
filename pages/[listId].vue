<script setup>
import { UseTimeAgo } from '@vueuse/components'
const { listId } = useRoute().params
const toast = useToast()
const newTodo = ref('')
const loading = ref(false)

const { data: todos } = await useFetch(`/api/${listId}`)

onMounted(() => {
  toast.add({
    title: 'Shared Todo List Created',
    description: 'Share this page to collaborate with others.'
  })
  new EventSource(`/api/${listId}`).addEventListener('message', (event) => {
    todos.value = JSON.parse(event.data)
  })
})

async function addTodo() {
  if (!newTodo.value.trim() || loading.value) return
  loading.value = true
  await $fetch(`/api/${listId}`, {
    method: 'POST',
    body: { text: newTodo.value }
  })
  loading.value = false
  newTodo.value = ''
}

async function editTodo(editId) {
  loading.value = true
  const getOne = await $fetch(`/api/${listId}/${editId}`, {
    method: 'GET',
  })
  loading.value = false
  newTodo.value = getOne.value.text
}

async function toggleTodo(todo) {
  await $fetch(`/api/${listId}/${todo.id}`, {
    method: 'PATCH',
    body: { completed: !todo.completed }
  })
}
async function deleteTodo(todoId) {
  await $fetch(`/api/${listId}/${todoId}`, {
    method: 'DELETE'
  })
}
</script>

<template>
  <div class="flex w-screen h-screen">
    <div class="w-[calc(100vw-300px)] h-full">
      <!-- <UAlert color="blue" variant="subtle" title="Share this page to collaborate with others." :actions="[{ label: 'Copy URL', click: copyUrl }, { label: 'New List', click: newList }]" /> -->
      <div class="w-[calc(100%-40px)] h-full overflow-y-auto m-auto max-w-[900px] shadow-xl px-2">
        <ul class="pt-6 divide-y divide-gray-200 dark:divide-gray-800">
          <li v-for="todo of todos" :key="todo.id" class="flex items-center gap-4 py-2">
            <div class="flex-1">
              <h3 class="text-lg font-medium" :class="[todo.completed ? 'line-through text-gray-500' : '']">
                {{ todo.text }}
              </h3>
              <span class="text-sm">
                <UseTimeAgo v-slot="{ timeAgo }" :time="todo.createdAt">Created {{ timeAgo }}</UseTimeAgo>
                <UseTimeAgo v-if="todo.createdAt !== todo.updatedAt" v-slot="{ timeAgo }" :time="todo.updatedAt">·
                  Updated
                  {{ timeAgo }}</UseTimeAgo>
              </span>
            </div>
            <UToggle :model-value="Boolean(todo.completed)" @update:model-value="toggleTodo(todo)" />
            <UButton color="blue" variant="soft" size="xl" icon="i-heroicons-x-edit-20-solid" @click="editTodo(todo.id)" />
            <UButton color="red" variant="soft" size="xl" icon="i-heroicons-x-mark-20-solid" @click="deleteTodo(todo.id)" />
          </li>
        </ul>
      </div>
    </div>
    <form class="flex flex-col gap-1 w-[300px] h-full shadow-xl shadow-black" @submit.prevent="addTodo">
      <UInput v-model="newTodo" size="xl" required placeholder="Add a todo item" />
      <UButton size="xl" type="submit" color="blue" icon="i-heroicons-plus-20-solid" :loading="loading" />
    </form>
  </div>
</template>