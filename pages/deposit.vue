<template>
  <div
    class="card mx-auto w-full lg:max-w-[min(80%,660px)] relative mb-[64px] grid"
  >
    <div class="_title fill-before px-6">Choose a coin</div>

    <div
      class="grid p-6 gap-[0.75rem] grid-cols-[repeat(auto-fill,minmax(max(calc(45%-1rem)),1fr))] lg:grid-cols-[repeat(auto-fill,minmax(max(calc(30%-1rem)),1fr))]"
    >
      <v-btn
        v-for="(coin, i) in coins"
        :key="i"
        class="p-6 w-full h-[96px] bg-blue-600 dark:bg-blue-300 text-lg ring-1 ring-opacity-10 ring-black dark:ring-white dark:ring-opacity-10"
        :class="{
          'bg-opacity-100 dark:bg-opacity-100 text-white dark:text-black hover:bg-opacity-90 dark:hover:bg-opacity-90 hover:opacity-100 opacity-100':
            selected == coin,
          'bg-opacity-0 dark:bg-opacity-0 hover:bg-opacity-20 dark:hover:bg-opacity-20 opacity-80 ':
            selected != coin
        }"
        @click="selected = coin"
        >¢{{ coin }}</v-btn
      >
    </div>

    <label
      for="order-quantity"
      class="_title fill-before px-6 mt-6"
      :class="{ 'opacity-70': !selected }"
      >Choose an amount</label
    >

    <Quantity
      id="order-quantity"
      v-model="quantity"
      class="m-6 justify-self-start"
      max="1000"
      :disabled="!selected"
    />

    <v-btn
      class="grid text-white dark:text-black px-8 min-w-[250px] lg:min-w-[300px] my-10 mx-auto h-[56px] font-semibold"
      :disabled="!selected || isLoading"
      :class="[
        {
          'bg-blue-gray-400 dark:bg-blue-gray-700': !selected,
          'bg-blue-700 dark:bg-blue-500': selected
        }
      ]"
      @click="placeOrder"
    >
      {{ actionText }}
      <div v-if="isLoading" class="spinner-border"></div>
    </v-btn>
  </div>
</template>

<script>
import deposit from '~/services/deposit'
import { formatAmount } from '~/utils/main'
export default {
  name: 'DepositPage',
  data: () => ({
    coins: ['100', '50', '20', '10', '5'],
    selected: '',
    quantity: 1,
    isLoading: false
  }),
  head() {
    return {
      title: 'Deposit coins'
    }
  },
  computed: {
    actionText() {
      return this.isLoading
        ? ''
        : !this.selected
        ? 'Choose a coin'
        : `Deposit ${formatAmount(parseFloat(this.selected) * this.quantity)}`
    }
  },
  methods: {
    async placeOrder() {
      this.isLoading = true
      const payload = {
        amount: parseFloat(this.selected),
        quantity: this.quantity
      }

      const { data, error } = await deposit.call(this, payload)

      this.isLoading = false

      this.selected = ''

      if (error) {
        return this.$commit('UPDATE', {
          path: 'notify',
          value: {
            message: error.message || 'An error occured. Try again later',
            error: true,
            timeout: 3000,
            key: Date.now()
          }
        })
      }

      if (data) {
        return this.$commit('UPDATE', {
          path: 'notify',
          value: {
            message: data.message,
            timeout: 3000,
            key: Date.now()
          }
        })
      }
    }
  }
}
</script>

<style>
._title {
  @apply text-lg font-semibold text-black dark:text-white leading-snug tracking-tight;
}
</style>
