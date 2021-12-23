<template>
  <div
    class="grid gap-y-6 w-screen content-start lg:w-[calc(100vw-280px)] xl:w-[calc(calc(min(100vw,1920px)-3rem)-280px)] max-w-full fade-appear pb-10"
    :class="{
      invisible: !authenticated
    }"
  >
    <div v-if="!errorPage" class="grid grid-flow-col justify-between px-6">
      <h2 class="text-3xl font-bold tracking-tight">{{ pageTitle }}</h2>
    </div>

    <p
      v-if="!showTotalBalance && !errorPage"
      class="px-6 font-semibold opacity-70 text-sm flex items-center"
    >
      Total {{ isBuyer ? 'deposit' : 'income' }}:
      <span :key="showBalanceIcon" class="ml-2 fade-appear inline-block">{{
        totalDeposit
      }}</span>

      <v-btn
        v-if="renderToggleBalance"
        class="ml-1 min-h-[38px]"
        :title="showBalance ? 'hide balance' : 'show balance'"
        icon
        @click="$toggleShowBalance"
      >
        <v-icon size="18" v-text="showBalanceIcon" />
      </v-btn>
    </p>

    <ul v-if="showBreadcrumbs" class="grid grid-flow-col justify-start ml-6">
      <li
        v-for="(path, i) in breadcrumbs"
        :key="i"
        class="flex justify-between items-center text-[0.925rem]"
      >
        <nuxt-link
          :disabled="path.active"
          :tabindex="path.active ? '-1' : undefined"
          :to="path.to"
          class="hover:underline"
          :class="[
            {
              'font-light opacity-70 text-[0.8rem]': path.active
            }
          ]"
          >{{ path.title }}</nuxt-link
        >
        <div v-if="i < breadcrumbs.length - 1" class="mx-3 opacity-40">•</div>
      </li>
    </ul>

    <!-- banner -->
    <div
      v-if="showBanner"
      class="rounded-md bg-gradient-to-b md:bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-400 dark:to-blue-600 text-white dark:text-blue-gray-900 p-8 grid md:grid-flow-col md:grid-cols-[auto 1fr] justify-start gap-x-4 mx-6 fade-slide-y-appear"
      style="--slide-y: 10px; --appear-duration: 150ms"
    >
      <div class="w-[200px] h-[200px] mx-auto">
        <Img width="200px" height="200px" :public-id="media.welcome" />
      </div>

      <div>
        <div
          class="bg-teal-600 font-medium text-white dark:text-black rounded-lg h-[32px] px-[10px] inline-grid place-items-center text-sm mb-4"
        >
          New
        </div>

        <h3 class="text-lg font-bold mb-2">Welcome to the Vending app</h3>
        <h4
          class="mb-8 text-[0.95rem] font-medium text-opacity-70 dark:text-opacity-80 text-white dark:text-blue-gray-900"
        >
          Your dashboard has been improved! Explore features like Orders,
          Account, Transactions and more.
        </h4>

        <v-btn
          class="bg-teal-600 px-4 text-white dark:text-black rounded-md"
          text
          @click="closeBanner"
          >Dismiss banner</v-btn
        >
      </div>
    </div>
    <!-- banner end-->
  </div>
</template>

<script>
import { capitalize } from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'DashboardTitle',

  props: {
    authenticated: Boolean,
    errorPage: Boolean,
    showBalance: Boolean,
    totalDeposit: {
      type: String,
      default: '--'
    },
    isBuyer: Boolean
  },

  data: () => ({
    raiseHeader: false
  }),

  computed: {
    ...mapState(['media', 'greeting']),

    renderToggleBalance() {
      return this.$store.getters.renderToggleBalance
    },

    showBalanceIcon() {
      return `mdi-${this.showBalance ? 'eye-off' : 'eye'}`
    },

    user() {
      return this.$store.state.user
    },
    showBanner() {
      if (!this.$store.state.bannerActive) {
        return false
      }

      return (
        !/^\/(reset-deposit|shop|create-product|account|search)\/?$/.test(
          this.$route.path
        ) && !this.errorPage
      )
    },
    showTotalBalance() {
      return !/^\/(reset-deposit|shop)\/?$/.test(this.$route.path)
    },
    showTitle() {
      return !/^\/reset-deposit\/?$/.test(this.$route.path)
    },

    breadcrumbs() {
      const route = this.$route

      const overviewPage = /^\/?$/.test(route.path)

      if (overviewPage || /^\/(account)\/?$/.test(this.$route.path)) {
        return null
      }

      const output = []

      const splitPaths = route.fullPath
        .replace(/\?.+=|&.+=/g, '/')
        .split('/')
        .filter(Boolean)

      if (splitPaths.length < 2) {
        return output
      }

      splitPaths.forEach((path, i, arr) => {
        let title = path

        if (/^p-/.test(title)) {
          title = this.$store.state.productName || 'loading title'
        } else {
          title = title.replace(/-/g, ' ')
        }

        output.push({
          title: decodeURI(capitalize(title)),
          active: i == arr.length - 1,
          to: `/${splitPaths.filter((_, key) => key - 1 < i).join('/')}`
        })
      })

      return output
    },
    showBreadcrumbs() {
      return (
        this.breadcrumbs &&
        this.breadcrumbs.length > 2 &&
        this.showTitle &&
        !this.errorPage
      )
    },

    pageTitle() {
      const route = this.$route

      const validRoutes = [
        {
          active: /^\/?$/.test(route.path),
          title: `Good ${this.greeting}.`
        },
        {
          active: /^\/deposit\/?$/.test(route.path),
          title: `Deposit`
        },
        {
          active: /^\/reset-deposit\/?$/.test(route.path),
          title: `Reset deposit`
        },
        {
          active: /^\/shop/.test(route.path),
          title: `Shop`
        },
        {
          active: /^\/create-product/.test(route.path),
          title: `Create product`
        },
        {
          active: /^\/my-products/.test(route.path) && !this.$route.query.edit,
          title: `My products`
        },
        {
          active: /^\/my-products/.test(route.path) && this.$route.query.edit,
          title: `Edit product`
        },
        {
          active: /^\/search/.test(route.path) && !this.$route.query.query,
          title: `Search app`
        },
        {
          active: /^\/search/.test(route.path) && this.$route.query.query,
          title: `Searching`
        },
        {
          active: /^\/account/.test(route.path),
          title: `Account`
        }
      ]

      return validRoutes.find((x) => x.active)?.title || 'Error'
    }
  },

  methods: {
    async closeBanner() {
      this.$commit('UPDATE', {
        path: 'bannerActive',
        value: false
      })

      await this.$apiCall('user', 'PATCH', { showBanner: false })

      await this.$refreshUser()
    }
  }
}
</script>
