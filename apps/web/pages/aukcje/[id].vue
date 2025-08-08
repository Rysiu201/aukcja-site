<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuctionsStore } from '~/stores/auctions';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const store = useAuctionsStore();
const auth = useAuthStore();
const amount = ref<number>(0);
const now = ref(Date.now());
const { $socket, $joinRoom } = useNuxtApp();
const id = Number(route.params.id);

onMounted(async () => {
  await store.fetchOne(id);
  $joinRoom(id);
  setInterval(() => (now.value = Date.now()), 1000);
  $socket.on('priceUpdate', (payload: any) => {
    if (!store.current) return;
    store.current.state.currentPrice = payload.price;
    store.current.state.currentLeaderId = payload.leaderId;
    store.current.state.endsAt = payload.endsAt;
    store.bids.unshift({ amount: payload.price, userId: payload.leaderId });
  });
});

function timeLeft(endsAt?: string) {
  if (!endsAt) return '---';
  const diff = new Date(endsAt).getTime() - now.value;
  if (diff <= 0) return 'koniec';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}m ${s}s`;
}

async function submitBid() {
  await store.placeBid(id, amount.value);
  amount.value = 0;
}
</script>

<template>
  <div v-if="store.current" class="p-4">
    <img
      v-if="store.current.imagePath"
      :src="store.current.imagePath"
      alt=""
      class="w-64 h-64 object-cover"
    />
    <h1 class="text-2xl font-bold mt-4">{{ store.current.title }}</h1>
    <p>{{ store.current.description }}</p>
    <p class="mt-2">Cena: {{ store.current.state.currentPrice }}</p>
    <p>Do końca: {{ timeLeft(store.current.state.endsAt) }}</p>

    <div class="mt-4">
      <h2 class="font-bold">Historia ofert</h2>
      <ul>
        <li v-for="bid in store.bids" :key="bid.id" class="text-sm">
          {{ bid.user?.email || bid.userId }}: {{ bid.amount }}
        </li>
      </ul>
    </div>

    <div v-if="auth.user" class="mt-4 flex gap-2">
      <input
        v-model.number="amount"
        type="number"
        class="border p-1"
        placeholder="Kwota"
      />
      <button @click="submitBid" class="bg-blue-500 text-white px-3 py-1">
        Złóż ofertę
      </button>
    </div>
  </div>
</template>
