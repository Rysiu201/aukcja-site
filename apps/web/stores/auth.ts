import { defineStore } from 'pinia';

interface User {
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    login(email: string, role: string = 'USER') {
      this.user = { email, role };
    },
    logout() {
      this.user = null;
    },
  },
});
