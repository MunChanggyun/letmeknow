export interface IApi {
    url: string,
    resType: any,
    data?: any
}

export interface IApiReturn {
    returnData: any[],
    financeInfo?: any[],
    priceInfo?: object,
    riskInfo?: IWaningFinc[],
    checkBuy?: IIsbuy,
    message: string
}

export interface IWaningFinc {
    status: number,
    message: string
}

export interface IIsbuy {
    isBuy: boolean,
    message: string
}