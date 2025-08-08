import { defineStore } from 'pinia';

export interface Auction {
  id: number;
  title: string;
  description: string;
  imagePath?: string;
  startPrice?: number;
  minIncrement?: number;
  startAt?: string;
  endAt?: string;
  state: {
    currentPrice: number;
    endsAt: string;
    currentLeaderId?: number;
  };
}

export const useAuctionsStore = defineStore('auctions', {
  state: () => ({
    list: [] as Auction[],
    current: null as Auction | null,
    bids: [] as any[],
  }),
  actions: {
    async fetchAll() {
      const config = useRuntimeConfig();
      this.list = await $fetch(`${config.public.apiUrl}/auctions`);
    },
    async fetchOne(id: number) {
      const config = useRuntimeConfig();
      this.current = await $fetch(`${config.public.apiUrl}/auctions/${id}`);
      try {
        this.bids = await $fetch(`${config.public.apiUrl}/auctions/${id}/bids`);
      } catch (e) {
        this.bids = [];
      }
    },
    async placeBid(id: number, amount: number) {
      const config = useRuntimeConfig();
      return await $fetch(`${config.public.apiUrl}/auctions/${id}/bids`, {
        method: 'POST',
        body: { amount },
        credentials: 'include',
      });
    },
  },
});
