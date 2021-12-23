<template>
  <v-app-bar fixed app elevate-on-scroll class="pl-4 pr-6 theme-background">
    <v-app-bar-nav-icon v-if="breakpoint.mobile" @click.stop="toggleDrawer" />
    <v-btn icon to="/search" nuxt>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-spacer />

    <v-btn
      title="toggle theme"
      class="p-0 w-[48px] h-[48px] rounded-full transform-gpu"
      :class="{
        'scale-0 opacity-0 pointer-events-none': searching
      }"
      :style="{
        'transition-delay': searching ? undefined : '60ms'
      }"
      :tabindex="searching ? '-1' : undefined"
      icon
      @click="theme.dark = !theme.dark"
    >
      <v-icon size="20px">
        mdi-{{ theme.dark ? 'weather-night' : 'white-balance-sunny' }}
      </v-icon>
    </v-btn>

    <v-btn
      v-for="(item, i) in icons"
      :key="i"
      :title="item.title"
      class="p-0 w-[48px] h-[48px] rounded-full transform-gpu"
      :class="{
        'scale-0 opacity-0 pointer-events-none': searching
      }"
      :style="{
        'transition-delay': searching
          ? `${(i + 1) * 30}ms`
          : `${(icons.length - (i + 1)) * 30}ms`
      }"
      :tabindex="searching ? '-1' : undefined"
      icon
    >
      <v-icon
        size="20px"
        @click="() => $commit('UPDATE', { path: 'mobileNav', value: true })"
      >
        mdi-{{ item.icon }}
      </v-icon>
    </v-btn>

    <nuxt-link
      v-ripple
      title="profile"
      class="p-0 w-[32px] h-[32px] min-h-[32px] rounded-full transform-gpu overflow-hidden isolate"
      :class="{
        'scale-0 opacity-0 pointer-events-none': searching
      }"
      :style="{
        'transition-delay': searching ? '60ms' : undefined
      }"
      :tabindex="searching ? '-1' : undefined"
      to="/account"
    >
      <Img
        :public-id="userImage"
        height="32px"
        width="32px"
        radius="max"
        fetch-format="auto"
        quality="100"
        class="object-cover"
      />
    </nuxt-link>
    <div class=""></div>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'DashboardHeader',

  data() {
    return {
      icons: [
        { icon: 'bell', title: 'notifications' },
        { icon: 'account-multiple', title: 'contact' }
      ],
      showSearchInput: false
    }
  },

  computed: {
    ...mapState(['drawer', 'user']),
    breakpoint() {
      return this.$vuetify.breakpoint
    },
    theme() {
      return this.$vuetify.theme
    },
    searching() {
      return /\/search\/?$/.test(this.$route.path)
    },
    userImage() {
      return this.user.image || '/samples/people/boy-snow-hoodie'
    },
    searchQuery() {
      return this.$route.query.query
    }
  },

  methods: {
    toggleDrawer() {
      this.$commit('UPDATE', { path: 'drawer', value: !this.drawer })
    }
  }
}
</script>
