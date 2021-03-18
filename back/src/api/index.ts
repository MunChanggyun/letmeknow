import Router from 'koa-router'
import auth from './auth/auth'
import company from './company/company'

const api = new Router();

api.use('/auth', auth.routes())
api.use('/company', company.routes())

export default api;