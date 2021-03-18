import { createAction, handleActions } from 'redux-actions'
import {takeLatest} from 'redux-saga/effects'
import * as authAPI from '../api/auth/auth'
import createRequestSaga, {createRequestActionTypes} from '../lib/createRequestSaga'

const TEMP_SET_USER = 'user/TEMP_SET_USER'  // 새로고침시 로그인 처리
const [CHECK, CHECK_SUCCESS, CHECK_FAILURE] = createRequestActionTypes('user/CHECK')

export const tempSetUser = createAction(TEMP_SET_USER, (user: string) => user)

export const check = createAction(CHECK)

const checkSaga = createRequestSaga(CHECK, authAPI.check)

export function* userSaga() {
    yield takeLatest(CHECK, checkSaga)
}

const initialState = {
    user: null,
    checkError: null
}

const user = handleActions({
    [TEMP_SET_USER]: (state, {payload: user}:any) => ({
        ...state,
        user
    }),
    [CHECK_SUCCESS]: (state, {payload: user}:any) => ({
        ...state,
        user,
        checkError: null
    }),
    [CHECK_FAILURE]: (state, {payload: error}:any) => ({
        ...state,
        user: null,
        checkError: error
    })
}, initialState)

export default user