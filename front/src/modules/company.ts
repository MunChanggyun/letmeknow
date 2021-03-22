import {createAction, handleActions} from 'redux-actions'
import createRequestSaga, {createRequestActionTypes} from '../lib/createRequestSaga'
import * as companyApi from '../api/company/company';
import {takeLatest} from 'redux-saga/effects'
import {CompanyType} from '../types/CompanyType';

// 회사 코드 최신화
const [CCODE, CCODE_SUCCESS, CCODE_FAILURE] = createRequestActionTypes('company/CCODE');
// 회사 검색
const [SEARCH_COMP, SEARCH_COMP_SUCCESS, SEARCH_COMP_FAILURE] = createRequestActionTypes('company/SEARCH_COMP');
// 회사 재 검색
const RE_SEARCH_COMP = 'company/RE_SEARCH_COMP';
// 회사 검색 기록 저장
const [SEARCH_LOG, SEARCH_LOG_SUCCESS, SEARCH_LOG_FAILURE] = createRequestActionTypes('company/SEARCH_LOG');

// 회사 코드 최신화 액션
export const cCodeList = createAction(CCODE);
// 회사 검색
export const searchComp = createAction(SEARCH_COMP, (companyName:string) =>({
    companyName: companyName
}));
// 회사 재검색
export const reSearchComp = createAction(RE_SEARCH_COMP, (companyName: string) => ({
    companyName: companyName
}))
// 회사 검색 기록 저장
export const saveSearchLog = createAction(SEARCH_LOG, ({_id, searchType}:CompanyType) => ({
    _id: _id,
    searchType: searchType
}))

// 회사 코드 최신화 사가
const cCodeSaga = createRequestSaga(CCODE, companyApi.cCodeDown)
// 회사검색
const searchCompSaga = createRequestSaga(SEARCH_COMP, companyApi.searchComp)
// 회사 검색 기록 저장
const saveSearchLogSaga = createRequestSaga(SEARCH_LOG, companyApi.saveSearchLog)

export function* companySaga() {
    yield takeLatest(CCODE, cCodeSaga)
    yield takeLatest(SEARCH_COMP, searchCompSaga)
    yield takeLatest(SEARCH_LOG, saveSearchLogSaga)
}

const initialState = {
    codeListError: null,
    companies: null,
};

const company = handleActions({
    [CCODE_FAILURE]: (state, {payload: error}: any) => ({
        ...state,
        codeListError: error
    }),
    [CCODE_SUCCESS]: (state, {payload: code}:any) => ({
        ...state,
        codeListError: null
    }),
    [SEARCH_COMP_SUCCESS]: (state, {payload: compnay}:any) => ({
        ...state,
        codeListError: null,
        companies: compnay
    }),
    [SEARCH_COMP_FAILURE]: (state, {payload: error}:any) => ({
        ...state,
        codeListError: error,
        companies: null,
    }),
    [RE_SEARCH_COMP]: (state, {payload: company}:any) =>({
        ...state,
        companies: (state.companies || []).filter((com:any, index: number) => {
            console.log(com.companyName, company.companyName, com.companyName.indexOf(company.companyName));

            return com.companyName.indexOf(company.companyName) > -1
        })
    }),
    [SEARCH_LOG_SUCCESS]: (state, {payload: compnay}:any) => ({
        ...state,
        codeListError: null,
        companies: compnay
    }),
    [SEARCH_LOG_FAILURE]: (state, {payload: error}:any) => ({
        ...state,
        codeListError: error,
        companies: null,
    }),
}, initialState);

export default company