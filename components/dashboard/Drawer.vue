<template>
  <v-navigation-drawer
    v-model="drawer"
    fixed
    app
    class="dark:bg-blue-gray-900 lg:dark:bg-opacity-40 root"
    @input="updateModel"
  >
    <div
      ref="scroll"
      class="pb-[64px] overscroll-contain max-h-[100vh] overflow-y-auto hide-scrollbar"
    >
      <div class="h-[96px] w-100 flex items-center justify-start px-4">
        <Img :public-id="media.favIco" height="38px" width="38px" />

        <p class="ml-1 cursive-text">Vending app</p>
      </div>

      <v-btn
        class="rounded-md h-[72px] w-[calc(100%-3rem)] bg-blue-gray-100 dark:bg-blue-gray-800 mx-auto grid grid-cols-[1fr] py-2 px-4 items-center cursor-pointer hover:bg-blue-gray-200 dark:hover:bg-blue-gray-800 justify-start text-left capitalize"
        :title="`${user.role} account`"
        to="/account"
      >
        <div
          class="h-[48px] w-[48px] rounded-full bg-blue-gray-400 overflow-hidden mr-[10%]"
        >
          <Img
            :public-id="userImage"
            height="48px"
            width="48px"
            radius="max"
            fetch-format="auto"
            quality="100"
            class="object-cover"
          />
        </div>

        <div class="overflow-hidden">
          <h2
            class="dark:text-white text-black font-semibold text-[0.9rem] capitalize truncate"
          >
            {{ user.displayName || user.username }}
          </h2>
          <h3
            class="dark:text-white text-black font-normal text-sm text-opacity-50 dark:text-opacity-50 truncate normal-case"
          >
            @{{ user.username }}
          </h3>
        </div>
      </v-btn>

      <div
        class="fill-before before:border-t before:border-black dark:before:border-white before:opacity-10 w-full h-[fit-content] relative mt-8"
      >
        <div class="grid">
          <h4
            class="uppercase font-medium text-black dark:text-white text-opacity-50 dark:text-opacity-50 text-[0.75rem] mt-[32px] px-8 mb-2"
          >
            General
          </h4>

          <v-list>
            <v-list-item-group
              v-model="generalLinksModel"
              mandatory
              color="blue"
              class="mx-auto mb-1"
            >
              <v-list-item
                v-for="(item, i) in generalLinks"
                :key="i"
                :to="item.to"
                nuxt
              >
                <v-list-item-icon>
                  <v-icon> mdi-{{ item.icon }} </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>

        <div class="grid">
          <h4
            class="uppercase font-medium text-black dark:text-white text-opacity-50 dark:text-opacity-50 text-[0.75rem] mt-[32px] px-8 mb-2"
          >
            Management
          </h4>

          <v-list>
            <v-list-item-group
              v-model="managementLinksModel"
              mandatory
              color="blue"
              class="mx-auto mb-1"
            >
              <v-list-item
                v-for="(item, i) in managementLinks.generic"
                :key="i"
                :to="item.to"
                nuxt
              >
                <v-list-item-icon>
                  <v-icon> mdi-{{ item.icon }} </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>

        <div
          class="grid mt-[32px] relative fill-before before:border-t before:border-black dark:before:border-white before:opacity-10"
        >
          <v-btn
            class="h-[42px] w-10/12 mx-auto mb-1 justify-start gap-x-2 text-[0.9rem] rounded-sm hover:before:bg-red-900 dark:hover:before:bg-red-700 mt-[32px] border border-red-600 dark:border-red-400 bg-red-700 dark:bg-red-600 bg-opacity-40 hover:text-white hover:bg-opacity-100 dark:bg-opacity-25"
            @click.native="logout"
          >
            <v-icon class="mr-3"> mdi-power </v-icon> Logout
          </v-btn>
        </div>
      </div>
    </div>

    <!-- <v-btn v-if="isMiniDevice" title="close nav" @click="closeNav">
      <v-icon> mdi-window-close </v-icon>
    </v-btn> -->
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DashboardDrawer',

  data() {
    return {
      drawer: true,
      ordersState: false,

      generalLinksModel: 1,
      managementLinksModel: undefined,

      items: [
        { icon: 'mdi-apps', title: 'Welcome', to: '/' },
        { icon: 'mdi-chart-bubble', title: 'Inspire', to: '/inspire' }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },

  computed: {
    ...mapState(['media', 'user']),

    isBuyer() {
      return this.user.role == 'buyer'
    },

    userImage() {
      return this.user.image || '/samples/people/boy-snow-hoodie'
    },

    generalLinks() {
      const route = this.$route

      const match = (path) => {
        const regExp = new RegExp(`^/dashboard/${path}/?`)

        return regExp.test(route.path)
      }

      return [
        {
          title: 'Overview',
          isActive: /^\/dashboard\/?$/.test(route.path),
          icon: 'home',
          to: '/'
        },
        {
          title: 'Analytics',
          isActive: match('analytics'),
          icon: 'chart-pie',
          to: '/analytics'
        },
        this.isBuyer && {
          title: 'Shop',
          isActive: match('shop'),
          icon: 'basket',
          to: '/shop'
        },
        {
          title: 'Finance',
          isActive: match('finance'),
          icon: 'finance',
          to: '/finance'
        },
        {
          title: 'Account',
          isActive: match('account'),
          icon: 'account-circle',
          to: '/account'
        }
      ].filter(Boolean)
    },

    managementLinks() {
      const route = this.$route

      const match = (path) => {
        const regExp = new RegExp(`^/${path}/?`)

        return regExp.test(route.path)
      }

      const buyerGeneric = [
        {
          title: 'Deposit coins',
          isActive: match('deposit'),
          icon: 'cash-fast',
          to: '/deposit'
        },
        {
          title: 'Reset deposit',
          isActive: match('reset-deposit'),
          icon: 'timeline-clock',
          to: '/reset-deposit'
        }
      ]

      const sellerGeneric = [
        {
          title: 'Create a product',
          isActive: match('create-product'),
          icon: 'cash-fast',
          to: '/create-product'
        },
        {
          title: 'My products',
          isActive: match('my-products'),
          icon: 'file-chart',
          to: '/my-products'
        }
      ]

      return {
        collapse: [
          {
            title: 'Orders',
            isActive: this.ordersState,
            icon: 'storeCog',
            collapse: true,
            children: [
              {
                title: 'List',
                isActive: match('orders/list'),
                to: '/orders/list'
              },
              {
                title: 'Details',
                isActive: match('orders/details'),
                to: '/orders/details'
              },
              {
                title: 'Clear orders',
                isActive: match('orders/clear-orders'),
                to: '/orders/clear-orders'
              }
            ]
          }
        ],
        generic: [
          {
            title: 'Transactions',
            isActive: match('transactions'),
            icon: 'history',
            to: '/transactions'
          },

          ...(this.user.role == 'buyer' ? buyerGeneric : sellerGeneric)
        ]
      }
    }
  },

  watch: {
    '$store.state.drawer'(n) {
      this.drawer = n
    }
  },

  methods: {
    updateModel(value) {
      this.$commit('UPDATE', {
        path: 'drawer',
        value
      })
    }
  }
}
</script>

<style scoped>
.root .v-list-item__icon {
  margin-right: 12px !important;
  margin-left: 10px !important;
}
</style>
