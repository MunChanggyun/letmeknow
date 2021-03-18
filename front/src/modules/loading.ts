import {createAction, handleActions} from 'redux-actions'
import {ActionType} from 'typesafe-actions'

const START_LOADING = 'loading/START_LOADING'
const FINISH_LOADING = 'loading/FINISH_LOADING'

export const startLoading = createAction(START_LOADING, (requestType:string) => requestType)
export const finishLoading = createAction(FINISH_LOADING, (requestType:string) => requestType)

const initialState = {}

const loading = handleActions({
    [START_LOADING]: (state, action: ActionType<typeof startLoading>) => (
        {
        ...state,
        [action.payload]: true
    }),
    [FINISH_LOADING]: (state, action:ActionType<typeof finishLoading>) => ({
        ...state,
        [action.payload]: false
    }),
}, initialState)


export default loading