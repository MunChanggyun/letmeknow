import {createAction, handleActions} from 'redux-actions'
import createRequestSaga, {createRequestActionTypes} from '../lib/createRequestSaga'
import * as companyApi from '../api/company/company';
import {takeLatest} from 'redux-saga/effects'
import {CompanyType} from '../types/CompanyType';

// 회사 코드 최신화
const [CCODE, CCODE_SUCCESS, CCODE_FAILURE] = createRequestActionTypes('company/CCODE');
// 회사 검색
const [SEARCH_COMP, SEARCH_COMP_SUCCESS, SEARCH_COMP_FAILURE] = createRequestActionTypes('company/SEARCH_COMP');

// 회사 코드 최신화 액션
export const cCodeList = createAction(CCODE);
// 회사 검색
export const searchComp = createAction(SEARCH_COMP, (companyName:string) =>({
    companyName: companyName
}));

// 회사 코드 최신화 사가
const cCodeSaga = createRequestSaga(CCODE, companyApi.cCodeDown)
// 회사검색
const searchCompSaga = createRequestSaga(SEARCH_COMP, companyApi.searchComp)

export function* companySaga() {
    yield takeLatest(CCODE, cCodeSaga)
    yield takeLatest(SEARCH_COMP, searchCompSaga)
}

const initialState = {
    codeListError: null
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
    [SEARCH_COMP_SUCCESS]: (state, {payload: code}:any) => ({
        ...state
    }),
    [SEARCH_COMP_FAILURE]: (state, {payload: code}:any) => ({
        ...state
    }),
}, initialState);

export default company