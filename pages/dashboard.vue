<script setup>
import { UseTimeAgo } from '@vueuse/components'
const toast = useToast()
const newTitle = ref('')
const newDesc = ref('')
const newTime = ref('')
const loading = ref(false)
const state = () => ({
  editStatus: 0,
  editId: ''
})

const { data: todos } = await useFetch('/api/dash')

onMounted(() => {
  toast.add({
    title: 'Shared Todo List Created',
    description: 'Share this page to collaborate with others.'
  })
  new EventSource('/api/dash').addEventListener('message', (event) => {
    todos.value = JSON.parse(event.data)
  })
})

async function addTodo() {
  if (!newTitle.value.trim() || loading.value) return
  loading.value = true
  await $fetch('/api/dash', {
    method: 'POST',
    body: { title: newTitle.value, description: newDesc.value, time: newTime.value }
  })
  loading.value = false
  state.editStatus = false
  newTitle.value = ''
  newDesc.value = ''
  newTime.value = ''
}

async function editTodo(editId) {
  loading.value = true
  const getOne = await $fetch(`/api/dash/${editId}`, {
    method: 'GET',
  })
  loading.value = false
  newTitle.value = getOne.value.title
  newDesc.value = getOne.value.description
  newTime.value = getOne.value.time
  state.editStatus = true
  state.editId = editId
}

function cancelEdit() {
  state.editStatus = false
}

async function updateTodo(id) {
  await $fetch(`/api/dash/${id}`, {
    method: 'PATCH',
    body: { title: newTitle.value, description: newDesc.value }
  })
  newTitle.value = ''
  newDesc.value = ''
  newTime.value = ''
  state.editStatus = false
  state.editId = ''
}

async function deleteTodo(todoId) {
  await $fetch(`/api/dash/${todoId}`, {
    method: 'DELETE'
  })
}
</script>

<template>
  <div class="flex w-screen h-screen">
    <div class="w-[calc(100vw-300px)] h-full overflow-y-auto">
      <!-- <UAlert color="blue" variant="subtle" title="Share this page to collaborate with others." :actions="[{ label: 'Copy URL', click: copyUrl }, { label: 'New List', click: newList }]" /> -->
      <div class="w-[calc(100%-40px)] m-auto max-w-[900px] shadow-xl px-2">
        <ul class="py-6 px-2 flex flex-col gap-4 dark:divide-gray-800">
          <li v-for="todo of todos" :key="todo.id" class="flex items-center gap-4 p-2 shadow rounded">
            <div class="flex-1">
              <h3 class="text-lg font-medium">
                {{ todo.title }}
              </h3>
              <p>{{ todo.description }}</p>
              <p class="text-sm">
                <UseTimeAgo v-slot="{ timeAgo }" :time="todo.createdAt">{{ timeAgo }}</UseTimeAgo>
                <UseTimeAgo v-if="todo.createdAt !== todo.updatedAt" v-slot="{ timeAgo }" :time="todo.updatedAt"> ·
                  {{ timeAgo }}</UseTimeAgo>
              </p>
              <p>{{ todo.time }}</p>
            </div>
            <!-- <UToggle :model-value="Boolean(todo.completed)" @update:model-value="updateTodo(todo.id)" /> -->
            <UButton color="blue" variant="solid" size="xl" icon="i-heroicons-pencil-20-solid" class="text-white" @click="editTodo(todo.id)" />
            <UButton color="red" variant="solid" size="xl" icon="i-heroicons-x-mark-20-solid" class="text-white" @click="deleteTodo(todo.id)" />
          </li>
        </ul>
      </div>
    </div>
    <form class="flex flex-col gap-1 w-[300px] h-full p-2 shadow-xl shadow-black" @submit.prevent="state.editStatus ? updateTodo(state.editId) : addTodo()">
      <h3 class="text-xl text">
        {{ state.editStatus ? "Edit Todo" : "Create Todo" }}
      </h3>
      <div>
        <label class="text-xl" for="title">Title</label>
        <UInput id="title" v-model="newTitle" size="xl" required placeholder="Enter Title" />
        <label class="text-xl" for="desc">Description</label>
        <UTextarea id="desc" v-model="newDesc" size="xl" :rows="3" required placeholder="Enter Description" />
        <label for="time">Alarm time</label>
        <UInput type="time" id="time" v-model="newTime" required />
      </div>
      <UButton size="xl" :label="state.editStatus ? 'Update' : 'Create'" type="submit" color="blue" icon="i-heroicons-plus-20-solid" :loading="loading" />
    </form>
  </div>
</template>