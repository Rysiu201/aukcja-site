<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuctionsStore } from '~/stores/auctions';

const store = useAuctionsStore();
const now = ref(Date.now());

onMounted(() => {
  store.fetchAll();
  setInterval(() => (now.value = Date.now()), 1000);
});

function timeLeft(endsAt?: string) {
  if (!endsAt) return '---';
  const diff = new Date(endsAt).getTime() - now.value;
  if (diff <= 0) return 'koniec';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}m ${s}s`;
}
</script>

<template>
  <div class="p-4 grid gap-4">
    <NuxtLink
      v-for="auction in store.list"
      :key="auction.id"
      :to="`/aukcje/${auction.id}`"
      class="border rounded p-2 flex gap-4"
    >
      <img
        v-if="auction.imagePath"
        :src="auction.imagePath"
        alt=""
        class="w-24 h-24 object-cover"
      />
      <div>
        <h2 class="font-bold">{{ auction.title }}</h2>
        <p>Cena: {{ auction.state.currentPrice }}</p>
        <p>Do końca: {{ timeLeft(auction.state.endsAt) }}</p>
      </div>
    </NuxtLink>
  </div>
</template>
