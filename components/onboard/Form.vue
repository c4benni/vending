<template>
  <v-form ref="form" v-model="valid" lazy-validation class="my-8 grid">
    <v-text-field
      v-for="(input, i) in formInputs"
      :key="i"
      v-model="fields[input.name]"
      v-bind="input"
      v-on="input.events"
    ></v-text-field>

    <h5
      v-if="!isLogin"
      class="text-normal font-bold mt-3 dark:text-gray-50 text-gray-600 opacity-70"
    >
      Choose type of account
    </h5>

    <div
      v-if="!isLogin"
      class="grid items-center justify-flex-start mt-2 w-full gap-x-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
    >
      <div
        v-for="(item, i) in accountRole"
        :key="i"
        v-ripple
        class="px-6 dark:hover:bg-blue-gray-800 hover:bg-blue-gray-100 hover:bg-opacity-70 dark:hover:text-white hover:text-black w-full justify-start my-1 grid-cols-1 h-[96px] content-center rounded-sm cursor-pointer ring-1"
        :class="[
          {
            'dark:bg-blue-gray-800 dark:text-white bg-blue-gray-300 text-black ':
              fields.role == item.title,
            'pointer-events-none grayscale': isLoading
          }
        ]"
        @click="updateRole(item.title)"
      >
        <div class="grid h-full w-full text-left">
          <div
            class="capitalize text-left relative grid items-center text-blue-gray-900 dark:text-blue-gray-50 font-bold text-xl"
          >
            {{ item.title }}

            <v-icon
              v-if="fields.role == item.title"
              class="absolute right-0 rounded-full bg-blue-800 dark:bg-blue-600 w-[28px] h-[28px] opacity-100 text-white"
            >
              mdi-check
            </v-icon>
          </div>

          <div
            class="font-light text-sm text-opacity-80 dark:text-opacity-50 dark:text-blue-gray-50 text-blue-gray-900"
          >
            {{ item.subtitle }}
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="!isLogin && roleInvalid"
      class="error--text text-[12px] pt-[4px] px-[12px]"
    >
      Please choose an account type
    </p>

    <v-checkbox v-model="formCheckbox" v-bind="checkboxAttrs"></v-checkbox>

    <v-btn
      color="primary"
      class="text-white w-full h-[48px] mx-auto md:max-w-[580px] xl:max-w-[620px] form-action hover:shadow-none hover:bg-blue-900 dark:hover:bg-blue-700"
      :class="{
        'mt-[32px]': !isLogin,
        'mt-[48px]': isLogin
      }"
      :loading="isLoading"
      @click="submitForm"
    >
      {{ formBtnText }}
    </v-btn>

    <div
      aria-label="already have an account"
      class="my-8 w-full lg:hidden text-center"
    >
      <h5
        class="text-base font-normal text-blue-gray-900 dark:text-blue-gray-100"
      >
        {{ loginText.h2 }}
        <nuxt-link :to="loginText.to" class="text-blue-400">
          {{ loginText.nuxtLink }}
        </nuxt-link>
      </h5>
    </div>
  </v-form>
</template>

<script>
import { capitalize } from 'lodash'

import onboard from '~/services/user'

export default {
  props: {
    isLogin: Boolean
  },

  data: () => ({
    valid: true,

    fields: {
      username: '',
      email: '',
      password: '',
      role: ''
    },

    showPassword: false,

    formCheckbox: false,

    isLoading: false,

    accountRole: [
      { title: 'buyer', subtitle: 'Deposit coins and buy items' },
      {
        title: 'seller',
        subtitle: 'Add products and monitor your profit'
      }
    ],

    roleInvalid: false
  }),

  computed: {
    formInputs() {
      const setFields = (label) => ({
        id: `${label}-field`,
        name: label,
        label: capitalize(label),
        required: true,
        filled: true,
        backgroundColor: 'bg-blue-900 bg-opacity-10',
        disabled: this.isLoading
      })

      return [
        {
          ...setFields('username'),
          autocomplete: 'username',
          rules: [
            (v) => !!v || 'Required',
            (v) =>
              (v && v.length >= 3) || 'Username must be at least 3 characters',
            (v) =>
              (v && v.length <= 20) || 'Username must be at most 20 characters'
          ]
        },

        {
          ...setFields('password'),
          autocomplete: 'new-password',
          type: this.showPassword ? 'text' : 'password',
          appendIcon: `mdi-${this.showPassword ? 'eye' : 'eye-off'}`,
          placeholder: '6+ characters',
          rules: [
            (v) => !!v || 'Required',
            (v) =>
              (v && v.length >= 6) || 'Username must be at least 6 characters',
            (v) =>
              (v && v.length <= 32) || 'Username must be at most 32 characters',
            (v) => (v && /[a-z]/.test(v)) || 'At least 1 lowercase',
            (v) => (v && /[A-Z]/.test(v)) || 'At least 1 uppercase',
            (v) => (v && /\d/.test(v)) || 'At least 1 number',
            (v) =>
              (v && /@|\$|!|%|\*|\?|&/.test(v)) ||
              'At least 1 special character'
          ],

          events: {
            'click:append': () => {
              this.showPassword = !this.showPassword
            },
            blur: () => {
              this.showPassword = false
            }
          }
        }
      ]
    },

    checkboxAttrs() {
      return {
        rules: !this.isLogin
          ? [(v) => !!v || 'You must agree to continue!']
          : undefined,
        label: this.isLogin ? 'Remember me' : 'Agree to terms and conditions',
        required: !this.isLogin,
        disabled: this.isLoading
      }
    },

    formBtnText() {
      return this.isLoading ? '' : this.isLogin ? 'LOGIN' : 'REGISTER'
    },

    loginText() {
      return {
        nuxtLink: this.isLogin ? 'Register' : 'Sign in',

        h2: this.isLogin ? "Don't have an account?" : 'Existing user?',

        to: !this.isLogin ? '/?login=true' : '/'
      }
    }
  },

  created() {
    this.formCheckbox = this.isLogin
  },

  methods: {
    validateForm() {
      this.$refs.form?.validate()
    },
    resetFormValidation() {
      this.$refs.form?.resetValidation()
    },
    resetForm() {
      this.$refs.form?.reset()

      this.roleInvalid = false
    },

    updateRole(role) {
      this.roleInvalid = false

      !this.isLoading && (this.fields.role = role)
    },

    async submitForm() {
      if (!this.valid) {
        this.resetFormValidation()

        await this.$sleep(64)
      }

      this.validateForm()

      this.roleInvalid = !/buyer|seller/.test(this.fields.role)

      await this.$nextTick()

      if (!this.isLogin && this.roleInvalid) {
        return
      }

      if (this.valid) {
        this.message = null

        this.isLoading = true

        const { username, password, role } = this.fields

        const form = { username, password }

        if (!this.isLogin) {
          form.role = role
        }

        const method = this.isLogin ? 'login' : 'register'

        const apiCall = onboard[method]

        const { data, error } = await apiCall.call(this, form)

        this.formCheckbox = false

        this.isLoading = false

        if (error) {
          this.fields.password = ''

          this.$emit('on-error', {
            text: error.message,
            timeout: 5000
          })

          this.resetFormValidation()

          return
        }

        if (data) {
          this.$emit('update-fetch-key', Date.now())

          scrollTo(0, 0)

          if (!this.isLogin) {
            this.$emit('account-created', this.fields.role)

            await this.$nextTick()

            return
          }

          console.log(data)

          this.$commit('UPDATE', {
            path: 'user',
            value: data
          })

          await this.$sleep()

          this.$router.replace('/')

          this.resetForm()
        }
      }
    }
  }
}
</script>
