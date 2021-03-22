import {Document} from 'mongoose';

export interface ICompany extends Document {
    username: string,
    companyName: string,
    companyCode: string,
    stockCode: string,
    searchDate?: Date,
    searchType?: string,
}