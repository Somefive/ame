import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:9000/'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.timeout = 5000

export default {
  generalSearch: async (qs, skip, limit, analyzer, strict) => { return axios.post('/search/general', {qs, skip, limit, analyzer, strict}) },
  search: async (qs, skip, limit, analyzer) => { return axios.post('/search', {qs, skip, limit, analyzer}) },
  suggest: async (query) => { return axios.post('http://localhost:9001/similar', {query}) }
}
