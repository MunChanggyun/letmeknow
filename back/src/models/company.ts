import mongoose, { Schema, Model } from 'mongoose'
import {ICompany} from './Interfaces/ICompany'

const CompanySchema = new Schema<ICompanyDocument, ICompanyModel>({
    companyName: String,
    companyCode: String,
    stockCode: String,
    searchDate: Date,
    searchType: String,
    user: {
        _id: mongoose.Types.ObjectId,
        username: String
    }
})

export interface ICompanyDocument extends ICompany {
    //
}

interface ICompanyModel extends Model<ICompanyDocument> {
    findCompany(query:any): Promise<ICompanyDocument>,
    updateCompany(companyName:string): Promise<ICompanyDocument>,
    removeCompanies(): Promise<ICompanyDocument>
}

CompanySchema.statics.removeCompanies = async function(this:Model<ICompanyDocument>) {
    this.remove();
    return "";
}

// 회사명으로 회사 코드 찾기 
CompanySchema.statics.findCompany = async function(this:Model<ICompanyDocument>, query:any) {
    console.log(query)

    return this.find(query);
}

// 업데이트
CompanySchema.statics.updateCompany = async function(this:Model<ICompanyDocument>, query:any) {
    return this.updateOne(query);
}

const CompanyModel = mongoose.model<ICompanyDocument, ICompanyModel>("company", CompanySchema);


export default CompanyModel;