<template>
  <v-app :key="rootKey" class="theme-background">
    <div
      v-if="!user"
      class="root min-h-full grid grid-flow-col grid-cols-1 lg:grid-cols-[min(100%,464px),1fr] relative max-w-[1350px] w-full mx-auto"
    >
      <div
        class="hidden lg:block w-[100%] max-w-[464px] pb-12 pt-6 sticky top-4 h-[fit-content] mt-14 ml-6 rounded-md dark:bg-blue-gray-800 bg-blue-gray-50 dark:text-white text-blue-gray-900 shadow-xl px-4 mb-8"
      >
        <div class="h-[420px] w-full px-4 pt-2">
          <Img
            :public-id="media.register"
            class="object-contain h-full mx-auto"
          />
        </div>

        <h1 class="text-3xl font-bold p-4 leading-normal">
          Buy and sell easily with
          <br />the Vending App.
        </h1>
      </div>

      <!-- form section -->

      <div
        class="w-[100%] h-[100%] grid justify-items-center items-center grid-cols-[1fr] grid-rows-[auto,1fr] fade-slide-x-appear"
      >
        <div
          class="max-w-[660px] xl:max-w-[780px] w-[100%] h-[100%] p-6 mt-[48px]"
        >
          <div
            aria-label="are you an existing user?"
            class="my-4 hidden lg:block"
          >
            <h2
              class="text-base font-normal text-right text-blue-gray-900 dark:text-blue-gray-100"
            >
              {{ loginText.h2 }}
              <nuxt-link
                :to="loginText.to"
                class="text-blue-400 hover:underline"
              >
                {{ loginText.nuxtLink }}
              </nuxt-link>
            </h2>
          </div>

          <transition
            :name="accountCreatedText.title ? 'fade-transition' : ''"
            mode="out-in"
          >
            <h3
              :key="loginText.h3"
              class="text-2xl font-bold tracking-tighter mb-2 text-blue-gray-800 dark:text-blue-gray-100"
              :style="{
                '--fade-duration': accountCreatedText.title ? '500ms' : ''
              }"
            >
              {{ loginText.h3 }}
            </h3>
          </transition>

          <h4
            class="font-normal text-base text-blue-gray-600 dark:text-blue-gray-200 text-opacity-70 dark:text-opacity-50"
          >
            {{ loginText.h4 }}
          </h4>

          <OnboardForm
            :is-login="isLogin"
            @update-fetch-key="updateFetchKey"
            @account-created="accountCreated"
            @on-error="onError"
          />
        </div>
      </div>

      <!-- form section ends -->
    </div>

    <div v-else class="w-[100%] h-[100%] grid place-items-center">
      <div class="spinner-border" style="--size: 2rem" />
    </div>

    <v-snackbar v-model="snackbar" :timeout="snackbarConfig.timeout" top right>
      {{ snackbarConfig.text }}

      <template #action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    fetchKey: null,

    accountCreatedText: { title: '', subtitle: '' },

    snackbar: false,

    snackbarConfig: {
      text: '',
      timeout: undefined
    }
  }),

  head() {
    return { title: this.isLogin ? 'Login' : 'Register' }
  },

  computed: {
    ...mapState(['media', 'user']),

    rootKey() {
      return `${this.isLogin}-${this.fetchKey}`
    },

    isLogin() {
      return this.$route.query.login === 'true'
    },

    loginText() {
      return {
        to: !this.isLogin ? '/?login=true' : '/',

        nuxtLink: this.isLogin ? 'Register' : 'Sign in',

        h2: this.isLogin ? "Don't have an account?" : 'Existing user?',

        h3: !this.isLogin
          ? `Get started, it's free.`
          : this.accountCreatedText.title || `Welcome back!`,

        h4: !this.isLogin
          ? `Start buying and selling easily anywhere you are`
          : this.accountCreatedText.subtitle || `Login to view your activities`
      }
    }
  },

  methods: {
    updateFetchKey(e) {
      this.fetchKey = e
    },

    async accountCreated(role) {
      this.accountCreatedText.title = 'Account created successfully!'

      const action = role == 'buyer' ? 'buying' : 'selling'

      this.accountCreatedText.subtitle = `Start ${action} on the vending app`

      await this.$nextTick()

      this.$router.push('/?login=true')

      // change account created text;
      await this.$sleep(2250)

      if (!this.accountCreatedText.title) {
        return
      }

      this.accountCreatedText.title = 'Login below'
    },

    async onError(e) {
      this.snackbarConfig = e

      await this.$nextTick()

      this.snackbar = true
    }
  }
}
</script>

<style></style>
