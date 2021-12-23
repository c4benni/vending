<template>
  <div class="grid gap-y-6">
    <DashboardTransaction />

    <div
      v-if="productsLength"
      class="card lg:mx-6 max-w-[100vw] lg:max-w-[calc(calc(min(100vw,1920px)-3rem)-280px)] lg:bg-opacity-100 bg-opacity-0 dark:bg-opacity-0 lg:dark:bg-opacity-50"
    >
      <div class="subtitle px-6">{{ productsSubTitle }}</div>

      <div class="title lead-subtitle fill-before px-6">
        {{ productsTitle }}
      </div>

      <div
        class="mt-6 grid gap-3 sm:gap-4 md:gap-6 overflow-x-scroll overflow-y-visible py-3 grid-cols-[repeat(10,auto),1px] w-full pl-6 pb-2 hide-scrollbar after:contents after:w-full"
      >
        <nuxt-link
          v-for="(product, i) in products"
          :key="i"
          v-ripple
          class="w-[calc(100vw-3rem)] sm:w-[min(calc(100vw-3rem),350px)] bg-white dark:bg-blue-gray-900 bg-opacity-100 dark:bg-opacity-50 pb-6 cursor-pointer hover:bg-blue-gray-50 dark:hover:bg-opacity-90 grid-flow-row p-0 text-left justify-stretch font-normal transform-gpu transition-transform hover:translate-y-[-0.25rem] rounded-md ring-1 ring-opacity-10 ring-black dark:ring-white dark:ring-opacity-10 text-black dark:text-white"
          :class="{ 'mr-6': i == products.length - 1 }"
          :to="getProductRoute(product.id)"
        >
          <div
            class="h-[300px] w-full hover:scale-[1.01] transform-gpu transition-transform fill-before before-divide before:border-b relative"
          >
            <Img
              :public-id="product.background"
              class="h-full object-cover w-full"
            />
          </div>

          <div class="px-4 pt-2">
            <div class="flex justify-between items-center">
              <div
                class="text-opacity-70 text-black dark:text-opacity-70 dark:text-white text-[0.8rem] capitalize"
              >
                {{ product.type }}
              </div>

              <div class="font-semibold">{{ formatCost(product.cost) }}</div>
            </div>
          </div>

          <div class="font-bold text-xl px-4 truncate capitalize">
            {{ product.productName }}
          </div>

          <v-rating class="mx-3 mt-2" readonly :value="4" color="amber" />
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { formatAmount } from '~/utils/main'

export default {
  head() {
    return {
      title: 'Overview'
    }
  },

  computed: {
    ...mapState(['products', 'user']),

    productsLength() {
      return Object.keys(this.products || {}).length
    },

    isBuyer() {
      return this.user?.role == 'buyer'
    },

    productsSubTitle() {
      const moreThanOne = this.productsLength > 1

      return `${moreThanOne ? 'New' : 'A new'} product${
        moreThanOne ? 's' : ''
      } added`
    },

    productsTitle() {
      return this.isBuyer
        ? 'Peep the store'
        : `My product${this.productsLength > 1 ? 's' : ''}`
    }
  },

  async created() {
    await this.fetchProducts()
  },

  methods: {
    ...mapActions(['getProducts']),

    formatCost(cost) {
      return formatAmount(cost)
    },
    async fetchProducts() {
      const query =
        this.user?.role == 'buyer'
          ? '?limit=10'
          : `?where={"sellerId":"${this.user?.id}"}&limit=10`

      await this.getProducts(query)
    },

    getProductRoute(id) {
      if (this.isBuyer) {
        return `/shop?id=${id}`
      }

      return `/my-products?edit=${id}`
    }
  }
}
</script>
