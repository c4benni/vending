<template>
  <div v-if="!appMounted" class="app-loading" title="loading...">
    <div class="loadingio-spinner-spinner-1uy29rd7r1c pointer-events-none">
      <div class="ldio-dy3y8kuse0b">
        <div v-for="i in 10" :key="i"></div>
      </div>
    </div>
  </div>
  <component :is="currentView" v-else />
</template>

<script>
import Vue from 'vue'

import { mapState } from 'vuex'

import { sleep } from '~/utils/main'

export default {
  head() {
    const links = []

    links.push(
      {
        hid: 'google-font-preconnect',
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      },
      {
        hid: 'gstatic-preconnect',
        rel: 'preconnect',
        crossorigin: 'true',
        href: 'https://fonts.gstatic.com'
      },
      {
        hid: 'public-sans-font',
        href: 'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
        rel: 'stylesheet'
      },
      {
        hid: 'satisfy-font',
        href: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
        rel: 'stylesheet'
      }
    )

    if (this.appMounted) {
      links.push(
        {
          hid: 'animations',
          rel: 'preload',
          as: 'style',
          href: 'css/animations.css'
        },
        {
          hid: 'animations',
          rel: 'stylesheet',
          href: 'css/animations.css'
        }
      )
    }
    return {
      title: this.$route.path == '/' ? 'Welcome' : 'Loading dashboard',
      link: [...links],
      htmlAttrs: {
        id: 'vending',
        lang: 'el'
      }
    }
  },

  computed: {
    ...mapState(['user', 'appMounted', 'showBalance']),

    currentView() {
      if (this.user) {
        return 'AppDashboard'
      }
      return 'AppOnboard'
    },

    theme() {
      return this.$vuetify.theme
    }
  },

  watch: {
    'theme.isDark'(n) {
      const currentTheme = !n ? 'dark' : 'light'
      const newTheme = n ? 'dark' : 'light'
// console.log({ currentTheme, newTheme })

      document.documentElement.classList.replace(currentTheme, newTheme)
    },

    async $route(n, o) {
      if (n.path == '/dashboard/account') {
        await this.$sleep(70)
        scrollTo(0, 0)
      } else {
        scrollTo(0, 0)
      }

      this.setGreetings()

      this.$commit('UPDATE', {
        path: 'mobileNav',
        value: false
      })

      if (n.path != '/' && o.path != '/' && n.path != o.path) {
        await this.$refreshUser()
      }
    }
  },

  beforeCreate() {
    Vue.prototype.$commit = this.$store.commit

    Vue.prototype.$dispatch = this.$store.dispatch

    Vue.prototype.$theme = this.$vuetify.theme

    Vue.prototype.$sleep = sleep
  },

  created() {
    this.onCreated()
  },

  beforeMount() {
    this.onBeforeMount()
  },

  mounted() {
    this.onMounted()
  },

  methods: {
    setGreetings() {
      const greeting = () => {
        const hr = new Date().getHours()

        if (hr >= 0 && hr < 12) {
          return 'morning'
        }
        if (hr >= 12 && hr < 17) {
          return 'afternoon'
        }
        return 'evening'
      }

      this.$commit('UPDATE', {
        name: 'greeting',
        value: greeting()
      })
    },

    onCreated() {
      this.setGreetings()

      Vue.prototype.$toggleShowBalance = (val = !this.showBalance) => {
        let value = val

        if (typeof value != 'boolean') {
          value = !this.showBalance
        }

        this.$commit('UPDATE', {
          path: 'showBalance',
          value
        })
      }

      Vue.prototype.$appProcessing = async (value) => {
        !value &&
          this.$commit('UPDATE', {
            path: 'dashboardDialog',
            value: {
              attrs: {
                persistent: true,
                value: false,
                contentClass: 'transparent shadow-none'
              },
              isLoading: true
            }
          })

        await this.$nextTick()

        this.$commit('UPDATE', {
          innerPath: 'dashboardDialog.attrs',
          path: 'value',
          value
        })
      }
    },

    async onBeforeMount() {
      window.history.scrollRestoration = 'auto'

      document.documentElement.classList.add(
        this.$theme.dark ? 'dark' : 'light'
      )

      Vue.prototype.$storeUser = async () => {
        const { data: res } = await this.$axios.get('/auth')

        const { data, error } = res

// console.log({ data })

        this.$commit('UPDATE', {
          path: 'user',
          value: !data
            ? null
            : {
                ...(this.$store.state.user || {}),
                ...data
              }
        })

        return { data, error }
      }

      Vue.prototype.$refreshUser = async (
        routeTo = '/?login=true',
        skipHomePage = true
      ) => {
        if (this.$route.path == '/' && skipHomePage) {
          return
        }

        const { data } = await this.$storeUser()

        if (!data && this.appMounted && this.$route.fullPath != routeTo) {
          this.$router.replace(routeTo)
        }
      }

      Vue.prototype.$apiCall = async (url, method = 'get', payload = {}) => {
        const objectMethod = typeof method == 'object'

        const getMethod = (objectMethod ? 'post' : method).toLocaleLowerCase()

        try {
          const { data: response } = await this.$axios[getMethod](url, payload)

          return { data: response.data, error: null }
        } catch (e) {
          const resError = e.response

          // expired session
          if (
            resError.status == 401 &&
            /expired/.test(resError.data.error.message)
          ) {
            this.$commit('UPDATE', {
              path: 'notify',
              value: {
                message: 'Session expired',
                error: true,
                timeout: 7500,
                key: Date.now()
              }
            })

            this.$commit('UPDATE', {
              value: null,
              path: 'user'
            })

            this.$router.replace('/?login=true')
          }

          return {
            error: resError.data.error,
            data: null
          }
        }
      }

      await this.$nextTick()

      await this.$refreshUser()

      await this.$nextTick()

      const session = this.user
      const path = this.$route.path

      // redirect back to dashboard if a logged in user is trying to access login page
      if (session && path == '/') {
        this.$router.replace('/dashboard')
      }

      // redirect back to login if a logged out user is trying to access dashboard
      else if (!session && path != '/') {
        return this.$router.replace('/')
      }
    },

    onMounted() {
      this.$commit('UPDATE', { path: 'appMounted', value: true })

      this.$nextTick(() => {
        const togglePageVisiblity = () => {
          const hidden =
            document.hidden || document.webkitHidden || document.msHidden
          const visibility =
            document.visibilityState ||
            document.webkitVisibilityState ||
            document.msVisibilityState
          const documentHidden = !!hidden || /^hidden/i.test(visibility)
          const toggleVisibility = (value) => {
            this.$commit('UPDATE', {
              value,
              path: 'pageVisible'
            })
          }

          if (documentHidden) {
            toggleVisibility(false)
          } else toggleVisibility(true)
        }

        togglePageVisiblity()

        document.addEventListener('visibilitychange', togglePageVisiblity)
      })
    }
  }
}
</script>

<style>
.app-loading {
  width: 100vw;
  height: 100vh;
  display: grid;
  place-content: center;
}

@keyframes ldio-dy3y8kuse0b {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.ldio-dy3y8kuse0b div {
  left: 48px;
  top: 30px;
  position: absolute;
  animation: ldio-dy3y8kuse0b linear 1s infinite;
  background: currentColor;
  width: 4px;
  height: 12px;
  border-radius: 2px / 3px;
  transform-origin: 2px 20px;
  pointer-events: none;
}
.ldio-dy3y8kuse0b div:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -0.9s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(2) {
  transform: rotate(36deg);
  animation-delay: -0.8s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(3) {
  transform: rotate(72deg);
  animation-delay: -0.7s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(4) {
  transform: rotate(108deg);
  animation-delay: -0.6s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(5) {
  transform: rotate(144deg);
  animation-delay: -0.5s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(6) {
  transform: rotate(180deg);
  animation-delay: -0.4s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(7) {
  transform: rotate(216deg);
  animation-delay: -0.3s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(8) {
  transform: rotate(252deg);
  animation-delay: -0.2s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(9) {
  transform: rotate(288deg);
  animation-delay: -0.1s;
  background: currentColor;
}
.ldio-dy3y8kuse0b div:nth-child(10) {
  transform: rotate(324deg);
  animation-delay: 0s;
  background: currentColor;
}
.loadingio-spinner-spinner-1uy29rd7r1c {
  width: 64px;
  height: 64px;
  display: inline-block;
  overflow: hidden;
  background: none;
}
.ldio-dy3y8kuse0b {
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateZ(0) scale(0.64);
  backface-visibility: hidden;
  transform-origin: 0 0; /* see note above */
}
.ldio-dy3y8kuse0b div {
  box-sizing: content-box;
}
/* generated by https://loading.io/ */
</style>
