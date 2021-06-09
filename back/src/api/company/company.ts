import Router from 'koa-router'
import * as companyCtrl from './company.ctrl'
import checkLoggedin from '../../lib/checkLoggedin'

const company = new Router();

// 회사코드 초기화
company.post('/companyCode', companyCtrl.callCodeApi)
// 권한 확인 예시
//company.post('/:id', companyCtrl.getCompanyById,  companyCtrl.companyList)

// 회사 검색
company.post('/search', companyCtrl.search)

// 회사 검색 기록 저장
company.post('/saveSearchLogAndGetDetail', companyCtrl.saveSearchLogAndGetDetail)

// 최근 검색 기록
company.post('/latestSearch', companyCtrl.latestSearch)

// test
company.post('/test', companyCtrl.test)

export default company;