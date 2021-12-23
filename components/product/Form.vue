<template>
  <div
    class="card mx-auto w-full lg:max-w-[min(80%,660px)] relative mb-[64px] grid"
  >
    <div>
      <p class="title mx-4 text-[1.25rem] leading-none mb-3">Product details</p>

      <p class="subtitle m-4 text-sm mt-0 leading-none">
        Required fields have * when empty
      </p>

      <div
        class="px-4 pb-12 mb-12 fill-before before-divide before:border-b before:w-[calc(100%-2rem)] before:left-[1rem] relative"
      >
        <component
          :is="input.tag || 'v-textarea'"
          v-for="(input, i) in productDetails"
          :key="i"
          v-model="form[input.name]"
          v-bind="{
            ...input.attrs,
            filled: true
          }"
        />
      </div>
    </div>

    <div
      class="px-4 pb-12 mb-12 fill-before before-divide before:border-b before:w-[calc(100%-2rem)] before:left-[1rem] relative"
    >
      <p class="title text-[1.25rem] leading-none mb-3">
        Product type{{ addAsterisk('type') }}
      </p>

      <p class="subtitle text-sm mt-0 leading-none">
        Products must have a type
      </p>

      <v-select
        v-model="form.type"
        :items="typeSelectOptions"
        item-text="title"
        item-value="value"
        :label="!form.type ? 'Choose a type' : ''"
      ></v-select>
    </div>

    <div
      class="px-4 pb-12 mb-12 fill-before before-divide before:border-b before:w-[calc(100%-2rem)] before:left-[1rem] relative"
    >
      <p class="title text-[1.25rem] leading-none mb-3">
        Product cost{{ addAsterisk('cost') }}
      </p>

      <p class="subtitle text-sm mt-0 leading-none">
        Choose a coin preset below.
      </p>

      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(min(45%,320px),1fr))] lg:grid-cols-[repeat(auto-fill,minmax(min(30%,320px),1fr))] gap-3 my-6"
      >
        <v-btn
          v-for="(cost, i) in costPreset"
          :key="`${i}-${form.cost == cost}`"
          :title="`select ¢${cost} coin`"
          class="h-[96px] w-full hover:bg-blue-700 hover:bg-opacity-80 active:bg-blue-900 active:text-white dark:hover:bg-opacity-80 dark:active:bg-blue-700 dark:active:bg-opacity-60 dark:active:text-black ring-1 ring-opacity-10 ring-black dark:ring-white dark:ring-opacity-10"
          :class="{
            'bg-blue-700 text-white dark:bg-blue-500 dark:text-black  fade-appear':
              form.cost == cost
          }"
          :color="form.cost == cost ? '' : 'transparent'"
          @click="() => setCost(cost)"
          >¢{{ cost }}</v-btn
        >
      </div>

      <p class="subtitle text-sm leading-none pt-6">
        Or enter an amount in multiples of 5
      </p>

      <Quantity
        id="product-cost"
        v-model.number="form.cost"
        class="mt-3"
        max="1000"
        min="5"
        step="5"
        use-chevron
      />
    </div>

    <div
      class="px-4 pb-12 fill-before before-divide before:border-b before:w-[calc(100%-2rem)] before:left-[1rem] relative grid justify-start"
    >
      <p class="title text-[1.25rem] leading-none mb-3">Inventory</p>

      <label for="product-inventory" class="subtitle text-sm mt-0 leading-none"
        >How many items are available?</label
      >

      <Quantity
        id="product-inventory"
        v-model.number="form.inventory"
        class="mt-6"
        max="1000"
        min="1"
      />
    </div>

    <div class="mt-6 pt-6 pb-12 grid">
      <div class="px-6 pb-12">
        <p class="mb-3 title text-[1.25rem]">Required fields:</p>

        <div
          v-for="(item, i) in requiredFields"
          :key="i"
          :class="{
            'text-green-700 dark:text-green-500': item.passed,
            'opacity-60': !item.passed
          }"
          class="grid grid-flow-col justify-start h-[32px] items-center gap-x-2 mb-2 text-[0.9rem]"
        >
          <span
            :class="{
              'opacity-60': !item.passed
            }"
            class="flex"
          >
            <v-icon
              size="20px"
              v-text="
                item.passed
                  ? 'mdi-circle-check-outline'
                  : 'mdi-circle-blank-checkbox'
              "
            />
          </span>
          {{ item.title }}
        </div>
      </div>

      <!-- default slot -->
      <slot></slot>
      <!-- default slot ends-->
    </div>
  </div>
</template>

<script>
import { capitalize } from 'lodash'
import { app } from '~/server-middleware/src/config/config'

export default {
  name: 'ProductForm',
  props: {
    fields: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    form: {
      name: '',
      caption: '',
      description: '',
      type: '',
      cost: '',
      inventory: 1
    },
    selectedType: '',
    selectedCost: '',

    typeSelectActive: false,

    detailsValidity: {
      name: false,
      caption: true,
      description: true
    }
  }),

  computed: {
    breakpoints() {
      return this.$store.state.breakpoints
    },
    miniDevice() {
      return this.$vuetify.breakpoint.mobile
    },
    costPreset() {
      // filter out 10 & 500 on mini devices.
      const output = ['5', '10', '20', '50', '100', '500'].filter((cost) =>
        this.miniDevice ? !/^10$|500/.test(cost) : true
      )

      return output
    },
    requiredFields() {
      return [
        {
          title: 'Unique Name',
          passed: this.form.name
        },
        {
          title: 'Valid Type',
          passed: !!this.form.type
        },
        {
          title: 'Valid Cost',
          passed: !!this.form.cost
        }
      ]
    },
    typeSelectOptions() {
      return app.validProductTypes.map((x) => {
        return {
          title: capitalize(x),
          value: x.replace(/\s/g, '-')
        }
      })
    },

    costSelectOptions() {
      return app.validCost.map((x) => {
        return {
          title: `¢${x}`,
          value: `${x}`
        }
      })
    },

    productDetails() {
      return [
        {
          name: 'name',

          tag: 'v-text-field',

          attrs: {
            disabled: (this.fields.name || {}).disabled,

            label: `Name${!this.form.name ? '*' : ''}`,
            required: true,
            placeholder: 'Unique name',
            min: 3,
            max: 99,

            rules: [
              (v) => v || 'Required',
              (v) => (v && v.length >= 3) || 'Min length is 3',
              (v) => (v && v.length <= 99) || 'Max length is 99'
            ]
          }
        },
        {
          name: 'caption',

          attrs: {
            label: 'Caption',
            placeholder: 'Brief description',
            min: 10,
            max: 255,
            type: 'textarea',
            rules: [
              (v) => v.length >= 10 || 'Min length is 10',
              (v) => v.length <= 255 || 'Max length is 255'
            ]
          }
        },
        {
          name: 'description',

          attrs: {
            label: 'Description',
            placeholder: 'Verbose description',
            min: 10,
            type: 'textarea',
            rules: [(v) => v.length >= 10 || 'Min length is 10']
          }
        }
      ]
    }
  },

  watch: {
    form() {
      this.updateParent()
    },

    selectedType() {
      this.updateParent()
    }
  },

  created() {
    this.updateParent()

    Object.keys(this.form).forEach((key) => {
      const initialValue = (this.fields[key] || {}).value

      if (typeof initialValue != 'undefined' && initialValue != null) {
        if (key == 'type') {
          return this.typeSelectUpdated(
            initialValue.replace(/\s/g, '-'),
            `${capitalize(initialValue)}`
          )
        }

        if (key == 'cost') {
          return this.costSelectUpdated(initialValue, `¢${initialValue}`)
        }

        this.form = {
          ...this.form,
          [key]: initialValue
        }
      }
    })
  },

  methods: {
    setCost(cost) {
      this.form.cost = parseFloat(cost)
    },
    updateParent() {
      this.$emit('update-parent', {
        detailsValidity: this.detailsValidity,
        form: this.form,
        selectedType: this.selectedType
      })
    },
    addAsterisk(path) {
      if (this.form[path]) {
        return ''
      }
      return '*'
    },
    // addFiles(e) {
    //     this.form.files = e
    // },

    typeSelectUpdated(value, title) {
      this.form.type = value.toLowerCase()

      this.selectedType = capitalize(title)
    },

    costSelectUpdated(value, title) {
      this.form.cost = value

      this.selectedCost = title
    }
  }
}
</script>
