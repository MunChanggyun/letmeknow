import produce from 'immer'
import { createAction, handleActions } from 'redux-actions'
import {ActionType} from 'typesafe-actions'
import createRequestSaga, {createRequestActionTypes} from '../lib/createRequestSaga'
import { takeLatest } from 'redux-saga/effects'
import * as authAPI from '../api/auth/auth'
import {IUser} from '../api/auth/types/IUser'

const CHANGE_FIELD = 'auth/CHANGE_FIELD'
const INITIALIZE_FORM = 'auth/INITALIZE_FORM'

// 회원가입
const [REGISTER, REGISTER_SUCCESS, REGISTER_FAILURE] = createRequestActionTypes('auth/REGISTER')
// 로그인
const [LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE] = createRequestActionTypes('auth/LOGIN')

// input type
type TChnageFieldPaylod = {
    form: string,
    key: string,
    value: string
}

// input 변경액션
export const changeField = createAction(
    CHANGE_FIELD,
    ({ form, key, value}:TChnageFieldPaylod) => ({
        form, key, value
    })
)

// 초기화 액션
export const initializeForm = createAction(INITIALIZE_FORM, (form: string) => form)

// 회원가입 액션
export const register = createAction(REGISTER, ({username, password, email}:IUser) => ({
    username, password, email
}))

// 로그인 액션
export const login = createAction(LOGIN, ({username, password}:IUser) => ({
    username, password
}))

// saga 생성
const registerSaga = createRequestSaga(REGISTER, authAPI.register);
const loginSaga = createRequestSaga(LOGIN, authAPI.login);

export function* authSaga() {
    yield takeLatest(REGISTER, registerSaga)
    yield takeLatest(LOGIN, loginSaga)
}

const initialState:any = {
    register: {
        username: '',
        password: '',
        passwordCheck: '',
        email: '',
    },
    login: {
        username: '',
        password: '',
    },
    auth: null,
    authError: null,
};


const auth = handleActions(
    {
        [CHANGE_FIELD]: (state, action: ActionType<typeof changeField>) => 
            produce(state, (draft: any) => {
                const {form, key, value} = action.payload

                draft[form][key] = value;
            }),
        [INITIALIZE_FORM]: (state, {paylad: form}:any) => ({
            ...state,
            [form]: initialState[form]
        }),
        [REGISTER_SUCCESS]: (state, {payload: auth}:any) => ({
            ...state,
            authError: null,
            auth
        }),
        [REGISTER_FAILURE]: (state, {payload: error}) => ({
            ...state,
            authError: error
        }),
        [LOGIN_SUCCESS]: (state, {payload: auth}:any) => ({
            ...state,
            authError: null,
            auth
        }),
        [LOGIN_FAILURE]: (state, {payload: error}) => ({
            ...state,
            authError: error
        })
    }, initialState 
)

export default auth;