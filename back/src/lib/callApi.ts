import {IApi, IApiReturn} from './interfaces/IRoot';
import axios, {AxiosResponse} from 'axios'

export const callApi = async ({url, resType, data}:IApi) => {
    let res:IApiReturn = {
        type: false,
        rows: null
    };

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log("url :: " , url);
    console.log("resType :: " , resType);
    console.log("params :: " , data);
    
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

    await axios({url: url, method: "GET", responseType:resType, params:data})
    .then(response => {
        res.type = true
        res.rows = response.data;
    })
    .catch(e => {
        res = e.message;
        
        
    });


    console.log(res);

    return res;
}
