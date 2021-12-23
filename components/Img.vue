<script>
import { mapState } from 'vuex'

export default {
  name: 'Img',

  computed: {
    ...mapState(['appMounted'])
  },

  render(h) {
    const attrs = this.$attrs

    const href = `${
      attrs.src || attrs.publicId || attrs['public-id'] || attrs.href
    }`

    if (!this.appMounted) {
      return h('a', {
        attrs: {
          href,
          rel: 'noopener noreferrer',
          title: 'image loading'
        },
        style: {
          height: attrs.height,
          width: attrs.width
        }
      })
    }

    const cloudinary = (d, c) => h('cld-image', d, c)

    return cloudinary({
      props: {
        publicId: href,
        // loading: 'lazy',
        ...attrs
      },
      attrs: {
        height: attrs.height,
        width: attrs.width
      },

      style: {
        height: attrs.height,
        width: attrs.width
      }
    })
  }
}
</script>
