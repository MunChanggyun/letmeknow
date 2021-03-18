import {call, put} from 'redux-saga/effects'
import {startLoading, finishLoading} from '../modules/loading'
import { AxiosResponse} from 'axios'

export const createRequestActionTypes = (type: string) => {
    const SUCCESS = `${type}_SUCCESS`
    const FAILURE = `${type}_FAILURE`

    return [type, SUCCESS, FAILURE]
}

export default function createRequestSaga(type: string, request:any) {
    const SUCCESS = `${type}_SUCCESS`
    const FAILURE = `${type}_FAILURE`

    return function*(action:any) {
        yield put(startLoading(type))

        try{
            console.log(request, action.payload);

            const response:AxiosResponse = yield call(request, action.payload)

            console.log("response", response);

            yield put({
                type:SUCCESS,
                payload: response.data
            })
        } catch(e) {
            yield put({
                type:FAILURE,
                payload: e,
                error: true
            })
        }
        
        yield put(finishLoading(type))
    }
}
