import { AdminApiClient, HaloRestAPIClient } from '@halo-dev/admin-api'

let accessToken = localStorage && localStorage.getItem('HALO__Access-Token')
accessToken = accessToken ? JSON.parse(accessToken) : undefined
if (accessToken && accessToken.expire > new Date().getTime()) {
  accessToken = accessToken['value']['access_token']
} else {
  accessToken = undefined
}

//halo http 请求客户端.
const haloRestApiClient = new HaloRestAPIClient({
  baseUrl: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8090',
  auth: { adminToken: accessToken }
})

// 通过 haloRestApiCLient 创建 adminApiClient。
const adminClient = new AdminApiClient(haloRestApiClient)

export default adminClient
