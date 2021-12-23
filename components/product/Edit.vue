<template>
  <div
    v-if="loading"
    class="grid h-screen w-full justify-center items-start mt-[48px]"
  >
    <Loader />
  </div>

  <div
    v-else-if="errorFetching"
    class="grid h-screen w-full justify-center items-start"
  >
    <p class="font-bold mt-[48px]">{{ errorFetching.message }}</p>
  </div>

  <ProductForm
    v-else
    :key="id + `${loading}`"
    :fields="fields"
    class="fade-appear"
    @update-parent="formUpdated"
  >
    <v-btn
      class="gap-x-2 w-8/12 h-[48px] mx-auto"
      :class="{
        'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-600 dark:hover:bg-opacity-70 dark:active:bg-blue-700 dark:active:bg-opacity-60':
          !disableUpdate
      }"
      :disabled="disableUpdate"
      @click="updateProduct"
    >
      <v-icon v-text="'mdi-update'" />Update product
    </v-btn>

    <v-btn
      class="gap-x-2 w-8/12 h-[48px] mx-auto mt-8 mb-3 text-bg-red-800 hover:bg-red-800 hover:text-white active:bg-red-900 active:text-white dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:hover:bg-opacity-70 dark:active:bg-red-700 dark:active:text-white dark:active:bg-opacity-60"
      outlined
      @click="deleteProduct"
    >
      <v-icon v-text="'mdi-delete'" />Delete this product
    </v-btn>
  </ProductForm>
</template>

<script>
import { capitalize } from 'lodash'

export default {
  name: 'ProductEdit',
  data: () => ({
    loading: true,
    errorFetching: null,
    product: {
      productName: 'Loading title',
      caption: null,
      description: null,
      type: null,
      cost: null,
      amountAvailable: null
    },

    detailsValidity: {
      caption: true,
      description: true
    },

    form: {
      type: null,
      cost: null,
      inventory: null
    },

    selectedType: ''
  }),
  head() {
    return {
      title: this.loading
        ? 'Loading product'
        : `Editing product ${this.product.productName}`
    }
  },

  computed: {
    disableUpdate() {
      const invalidDetail = Object.values(this.detailsValidity).includes(false)

      const { type, cost, inventory } = this.form

      return invalidDetail || !type || !cost || !inventory
    },
    id() {
      return this.$route.query.edit
    },

    fields() {
      return {
        name: {
          value: this.product.productName || 'Loading...',
          disabled: true
        },
        caption: {
          value: this.product.caption
        },
        description: {
          value: this.product.description
        },
        type: {
          value: this.product.type || 'Loading...',
          disabled: true
        },
        cost: {
          value: parseFloat(this.product.cost) || 'Loading'
        },
        inventory: {
          value: parseFloat(this.product.amountAvailable || -1)
        }
      }
    }
  },

  async created() {
    await this.fetchProduct()
  },

  mounted() {
    scrollTo(0, 0)
  },

  methods: {
    async fetchProduct() {
      this.loading = true

      const { data, error } = await this.$apiCall(`product?id=${this.id}`)

      this.loading = false

      if (data) {
        this.product = { ...data }

        this.$commit('UPDATE', {
          path: 'productName',
          value: data.productName
        })
      } else {
        this.errorFetching = {
          ...error,
          message: capitalize(error.message || 'An error occured')
        }
      }
    },
    formUpdated(e) {
      this.form = e.form

      const { caption, description } = e.detailsValidity
      this.detailsValidity = {
        caption,
        description
      }

      this.selectedType = e.selectedType
    },
    async updateProduct() {
      if (this.disableUpdate) {
        return null
      }

      // reset dialog message
      this.$commit('UPDATE', {
        path: 'processingDone',
        value: null
      })

      await this.$nextTick()

      // set dialog message
      this.$commit('UPDATE', {
        path: 'processingDone',
        value: {
          title: 'Updating product',
          subtitle: 'Please wait while we update your product.'
        }
      })

      await this.$nextTick()

      // show dialog
      this.$commit('UPDATE', {
        path: 'dashboardProcessing',
        value: true
      })

      const { caption, description, cost, inventory } = this.form

      const productForm = {
        id: this.id,
        amountAvailable: inventory,
        cost,
        type: this.selectedType.toLowerCase()
      }

      caption && (productForm.caption = caption)

      description && (productForm.description = description)

      const { error } = await this.$dispatch('updateProduct', productForm)

      this.$commit('UPDATE', {
        path: 'dashboardSnackbar',
        value: {
          attrs: {
            timeout: 3000,
            key: Date.now(),
            top: true,
            right: true
          },
          title: error ? 'An error occured' : 'Product updated',
          error: !!error
        }
      })

      await this.$nextTick()

      this.$commit('UPDATE', {
        path: 'value',
        innerPath: 'dashboardSnackbar.attrs',
        value: true
      })

      if (!error) {
        await this.$sleep(100)

        this.$router.push('/my-products')
      }
    },
    deleteProduct() {
      this.$commit('UPDATE', {
        path: 'notify',
        value: {
          message:
            'Are you sure you want to delete this product? This action cannot be reversed.',
          error: true,
          closeText: 'Delete product',
          callback: async () => {
            this.$commit('UPDATE', {
              path: 'notify',
              value: { message: null }
            })

            this.$commit('UPDATE', {
              path: 'processingDone',
              value: null
            })

            const { error } = await this.$dispatch('deleteProduct', this.id)

            await this.$sleep(100)

            this.$commit('UPDATE', {
              path: 'dashboardSnackbar',
              value: {
                attrs: {
                  timeout: 3000,
                  key: Date.now(),
                  top: true,
                  right: true
                },
                title: error ? 'An error occured' : 'Product updated',
                error: !!error
              }
            })

            await this.$nextTick()

            this.$commit('UPDATE', {
              path: 'value',
              innerPath: 'dashboardSnackbar.attrs',
              value: true
            })

            if (!error) {
              await this.$sleep(100)

              this.$router.replace('/my-products')
            }
          },
          key: Date.now()
        }
      })
    }
  }
}
</script>
