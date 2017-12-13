import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:9000/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.timeout = 5000

export default {
  generalSearch: async (qs, skip, limit) => { return axios.post('/search/general', {qs, skip, limit}) }
}
