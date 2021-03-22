import client from '../client'
import {CompanyType} from '../../types/CompanyType';

// 회사코드 다운로드
export const cCodeDown = () => client.post('/api/company/companyCode')

// 회사 검색
export const searchComp = (companyName:string) => client.post('/api/company/search', (companyName))

// 회사 검색기록 저장  saveSearchLog
export const saveSearchLog = ({_id, searchType}:CompanyType) => client.post('/api/company/saveSearchLog', ({_id, searchType}))