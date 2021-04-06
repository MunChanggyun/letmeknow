export interface IApi {
    url: string,
    resType: any,
    data?: any
}

export interface IApiReturn {
    returnData: any[],
    message: string
}