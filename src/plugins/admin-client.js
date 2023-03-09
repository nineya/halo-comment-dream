import { AdminApiClient, Axios, HaloRestAPIClient } from '@halo-dev/admin-api'

// let accessToken = localStorage && localStorage.getItem('HALO__Access-Token')
// accessToken = accessToken ? JSON.parse(accessToken) : undefined
// if (accessToken && accessToken.expire > new Date().getTime()) {
//   accessToken = accessToken['value']['access_token']
// } else {
//   accessToken = undefined
// }
//
// //halo http 请求客户端.
// const haloRestApiClient = new HaloRestAPIClient({
//   baseUrl: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8090',
//   auth: { adminToken: accessToken }
// })
//
// // 通过 haloRestApiCLient 创建 adminApiClient。
// const adminClient = new AdminApiClient(haloRestApiClient)

let accessToken = localStorage && localStorage.getItem('HALO__Access-Token')
accessToken = accessToken ? JSON.parse(accessToken) : undefined

let adminClient

if (accessToken) {
  //halo http 请求客户端.
  const haloRestApiClient = new HaloRestAPIClient({
    baseUrl: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8090'
  })
  // 通过 haloRestApiCLient 创建 adminApiClient。
  adminClient = new AdminApiClient(haloRestApiClient)

  haloRestApiClient.interceptors.request.use(
    config => {
      config.headers['Admin-Authorization'] = accessToken['value']['access_token']
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  let isRefreshingToken = false
  let pendingRequests = []

  haloRestApiClient.interceptors.response.use(
    response => {
      return response
    },
    async error => {
      const response = error.response
      const data = response ? response.data : null

      if (Axios.isCancel(error) || /Network Error/.test(error.message) || !data || data.status !== 401) {
        return Promise.reject(error)
      }

      const originalRequest = error.config

      if (isRefreshingToken) {
        return new Promise(resolve => {
          pendingRequests.push(() => {
            resolve(Axios(originalRequest))
          })
        })
      }
      isRefreshingToken = true
      try {
        accessToken['value'] = await adminClient
          .refreshToken(accessToken['value']['refresh_token'])
          .then(response => response.data)
        accessToken.expire = new Date().getTime() + accessToken['value']['expired_in'] * 1000
        localStorage.setItem('HALO__Access-Token', JSON.stringify(accessToken))
        pendingRequests.forEach(callback => callback())
        pendingRequests = []

        return Axios(originalRequest)
      } catch (e) {
        return Promise.reject(e)
      } finally {
        isRefreshingToken = false
      }
    }
  )
}

export default adminClient
