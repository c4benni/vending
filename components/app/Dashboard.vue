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
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'showBalance']),

    ...mapGetters(['userInfo']),

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
  }
}
</script>
