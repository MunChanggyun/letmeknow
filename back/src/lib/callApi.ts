import {IApi, IApiReturn} from './interfaces/IRoot';
import axios, {AxiosResponse} from 'axios'

export const callApi = async ({url, resType, data}:IApi) => {
    let res:IApiReturn = {
        type: false,
        rows: null
    };

    await axios({url: url, method: "GET", responseType:resType, params:data})
    .then(response => {
        res.type = true
        res.rows = response.data;
    })
    .catch(e => {
        res = e.message;
        
        
    });

    return res;
}
