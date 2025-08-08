<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Profil</h1>
    <div v-if="auth.user">
      <p>Email: {{ auth.user.email }}</p>
      <p>Rola: {{ auth.user.role }}</p>
    </div>
    <div v-else>
      <p>Nie zalogowano</p>
    </div>
  </div>
</template>
