<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuctionsStore } from '~/stores/auctions';

const store = useAuctionsStore();
const editing = ref<number | null>(null);
const form = ref({
  title: '',
  description: '',
  startPrice: 0,
  minIncrement: 0,
  startAt: '',
  endAt: '',
  image: null as File | null,
});

onMounted(() => {
  store.fetchAll();
});

function edit(a: any) {
  editing.value = a.id;
  form.value = {
    title: a.title,
    description: a.description,
    startPrice: a.startPrice,
    minIncrement: a.minIncrement,
    startAt: a.startAt?.slice(0, 16),
    endAt: a.endAt?.slice(0, 16),
    image: null,
  };
}

async function submit() {
  const config = useRuntimeConfig();
  const fd = new FormData();
  fd.append('title', form.value.title);
  fd.append('description', form.value.description);
  fd.append('startPrice', String(form.value.startPrice));
  fd.append('minIncrement', String(form.value.minIncrement));
  fd.append('startAt', form.value.startAt);
  fd.append('endAt', form.value.endAt);
  if (form.value.image) fd.append('image', form.value.image);
  const url = editing.value
    ? `${config.public.apiUrl}/auctions/${editing.value}`
    : `${config.public.apiUrl}/auctions`;
  await $fetch(url, {
    method: editing.value ? 'PATCH' : 'POST',
    body: fd,
    credentials: 'include',
  });
  editing.value = null;
  form.value = {
    title: '',
    description: '',
    startPrice: 0,
    minIncrement: 0,
    startAt: '',
    endAt: '',
    image: null,
  };
  await store.fetchAll();
}

async function closeAuction(id: number) {
  const config = useRuntimeConfig();
  await $fetch(`${config.public.apiUrl}/auctions/${id}/close`, {
    method: 'POST',
    credentials: 'include',
  });
  await store.fetchAll();
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Panel admina</h1>

    <form @submit.prevent="submit" class="mb-8 flex flex-col gap-2 max-w-md">
      <input v-model="form.title" placeholder="Tytuł" class="border p-1" />
      <textarea v-model="form.description" placeholder="Opis" class="border p-1" />
      <input v-model.number="form.startPrice" type="number" placeholder="Cena startowa" class="border p-1" />
      <input v-model.number="form.minIncrement" type="number" placeholder="Minimalna podwyżka" class="border p-1" />
      <input v-model="form.startAt" type="datetime-local" class="border p-1" />
      <input v-model="form.endAt" type="datetime-local" class="border p-1" />
      <input type="file" @change="e => form.image = (e.target as HTMLInputElement).files?.[0] || null" />
      <button class="bg-green-500 text-white px-3 py-1 w-32">
        {{ editing ? 'Zapisz' : 'Dodaj' }}
      </button>
    </form>

    <ul>
      <li
        v-for="a in store.list"
        :key="a.id"
        class="border p-2 mb-2 flex justify-between items-center"
      >
        <span>{{ a.title }}</span>
        <span class="flex gap-2">
          <button @click="edit(a)" class="bg-blue-500 text-white px-2 py-1">Edytuj</button>
          <button @click="closeAuction(a.id)" class="bg-red-500 text-white px-2 py-1">Zamknij</button>
        </span>
      </li>
    </ul>
  </div>
</template>
