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
// 최근 검색 목록
const [LATEST_SEARCH, LATEST_SEARCH_SUCCESS, LATEST_SEARCH_FAILURE] = createRequestActionTypes('company/LATEST_SEARCH');

// 회사 코드 최신화 액션
export const cCodeList = createAction(CCODE);
// 회사 검색
export const searchComp = createAction(SEARCH_COMP, (companyName:string) =>(
    companyName
));
// 회사 재검색
export const reSearchComp = createAction(RE_SEARCH_COMP, (companyName: string) => ({
    companyName: companyName
}))
// 회사 검색 기록 저장
export const saveSearchLogAndGetDetail = createAction(SEARCH_LOG, ({_id, searchType}:CompanyType) => ({
    _id: _id,
    searchType: searchType
}))
// 최근 검색
export const latestSearch = createAction(LATEST_SEARCH);

// 회사 코드 최신화 사가
const cCodeSaga = createRequestSaga(CCODE, companyApi.cCodeDown)
// 회사검색
const searchCompSaga = createRequestSaga(SEARCH_COMP, companyApi.searchComp)
// 회사 검색 기록 저장
const saveSearchLogAndGetDetailSaga = createRequestSaga(SEARCH_LOG, companyApi.saveSearchLogAndGetDetail)
// 최근 검색
const latestSearchSaga = createRequestSaga(LATEST_SEARCH, companyApi.latestSearch)
export function* companySaga() {
    yield takeLatest(CCODE, cCodeSaga)
    yield takeLatest(SEARCH_COMP, searchCompSaga)
    yield takeLatest(SEARCH_LOG, saveSearchLogAndGetDetailSaga)
    yield takeLatest(LATEST_SEARCH, latestSearchSaga)
}

const initialState = {
    codeListError: null,
    companies: null,
    latestCompany: null,
    finances: null,
    message: null,
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
            return com.companyName.indexOf(company.companyName) > -1
        })
    }),
    [SEARCH_LOG_SUCCESS]: (state, {payload: result}:any) => ({
        ...state,
        codeListError: null,
        finances: result.returnData,
        message: result.message
    }),
    [SEARCH_LOG_FAILURE]: (state, {payload: error}:any) => ({
        ...state,
        codeListError: error,
        finances: null,
    }),
    [LATEST_SEARCH_SUCCESS]: (state, {payload: companies}:any) =>({
        ...state,
        latestCompany: companies,
        codeListError: null
    }),
    [LATEST_SEARCH_FAILURE]: (state, {payload: error}:any) => ({
        ...state,
        latestCompany: null,
        codeListError: error
    })
}, initialState);

export default company