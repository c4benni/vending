<template>
  <v-app dark>
    <DashboardDrawer />

    <DashboardHeader />

    <v-main class="theme-background">
      <v-container>
        <DashboardTitle v-bind="dashboardTitleAttrs" />

        <Nuxt />
      </v-container>
    </v-main>

    <!-- app level snackbar -->
    <v-snackbar v-bind="snackbarAttrs">
      {{ dashboardSnackbar.title }}

      <template #action="{ attrs }">
        <v-btn
          v-for="(action, i) in snackbarActions"
          :key="i"
          v-bind="{ ...attrs, ...action.attrs }"
          v-on="action.events"
        >
          {{ action.title }}
        </v-btn>
      </template>
    </v-snackbar>
    <!-- app level snackbar ends -->

    <!-- dashboard dialog -->

    <v-dialog v-bind="dialogAttrs">
      <div v-if="appLoading" class="grid justify-center items-center">
        <Loader />
      </div>

      <v-card v-else>
        <v-card-title class="text-h5">
          Use Google's location service?
        </v-card-title>
        <v-card-text
          >Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="dialog = false">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dashboard dialog ends -->
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState([
      'user',
      'showBalance',
      'dashboardSnackbar',
      'dashboardDialog',
      'dashboardProcessing'
    ]),

    ...mapGetters(['userInfo']),

    appLoading() {
      return this.dashboardDialog.isLoading
    },

    dialogAttrs() {
      const state = this.dashboardDialog.attrs || { key: 'snackbar-key' }

      return {
        overlayColor: 'black',
        ...state
      }
    },

    snackbarAttrs() {
      return this.dashboardSnackbar.attrs || { key: 'snackbar-key' }
    },

    snackbarActions() {
      const { actions } = this.dashboardSnackbar

      if (actions) {
        return actions
      }

      const defaults = [
        {
          title: 'Dismiss',
          attrs: {
            color: 'blue',
            text: true
          },
          events: {
            click: () => {
              this.$commit('UPDATE', {
                path: 'value',
                innerPath: 'dashboardSnackbar.attrs',
                value: false
              })
            }
          }
        }
      ]

      return defaults
    },

    totalDeposit() {
      const userInfo = this.userInfo

      const availableAmount =
        userInfo[userInfo.isBuyer ? 'depositTotal' : 'incomeTotal'] || 0

      if (!this.showBalance) {
        return '*'.repeat(5)
      }

      return availableAmount
    },

    dashboardTitleAttrs() {
      return {
        authenticated: this.authenticated,
        errorPage: this.errorPage,
        showBalance: this.showBalance,
        totalDeposit: this.totalDeposit,
        isBuyer: this.isBuyer
      }
    },

    isBuyer() {
      return this.userInfo.isBuyer
    },

    errorPage() {
      return this.$route.params.error
    },

    authenticated() {
      return !!this.user?.id
    },

    isSearch() {
      return /\/search\/?$/.test(this.$route.path)
    }
  },

  created() {
    this.$appProcessing(false)
  }
}
</script>
