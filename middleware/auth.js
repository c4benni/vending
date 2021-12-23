export default async function ({ store, redirect, route, req, axios }) {
  // redirect if not logged in and path isnt / and app mounted
  const appMounted = store.state.appMounted

  if (req) {
    const scheme = req.connection.encrypted ? 'https://' : 'http://'

    const host = req.headers.host

    const res = await fetch(`${scheme}${host}/api/v1/auth`, {
      headers: req.headers
    })

    const resp = await res.json()

    const { data } = resp

    store.commit('UPDATE', {
      path: 'user',
      value: data || null
    })
  }

  if (!appMounted) {
    return
  }

  const session = store.state.user
  const loginPage = route.path == '/'

  // redirect to login if not logged in;
  if (!session && !loginPage) {
    return redirect({
      path: '/',
      query: {
        login: true
      }
    })
  }

  const redirectUnauthorized = (role, paths) => {
    // redirect to 404 when user is accesses wrong routes;
    if (session?.role == role) {
      const unauthorized = paths

      const isUnauthorized = unauthorized.find((x) => {
        const regExp = new RegExp(`^/${x}/?`)

        return regExp.test(route.path)
      })

      if (isUnauthorized) {
        return redirect('/unauthorized')
      }
    }
  }

  redirectUnauthorized('buyer', ['create-product', 'my-products'])
  redirectUnauthorized('seller', ['deposit', 'reset', 'shop', 'shop?id=.+'])

  if (
    route.path == '/create-product' &&
    store.state.dashboardProcessing &&
    !store.state.processingDone
  ) {
    return redirect('/create-product')
  }
}
