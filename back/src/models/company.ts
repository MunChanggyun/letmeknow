import mongoose, { Schema, Model } from 'mongoose'
import {ICompany} from './Interfaces/ICompany'

const CompanySchema = new Schema<ICompanyDocument, ICompanyModel>({
    companyName: String,
    companyCode: String,
    stockCode: String,
    user: {
        _id: mongoose.Types.ObjectId,
        username: String
    }
})

interface ICompanyDocument extends ICompany {
    //
}

interface ICompanyModel extends Model<ICompanyDocument> {
    findCompany(companyName:string): Promise<ICompanyDocument>
    removeCompanies(): Promise<ICompanyDocument>
}

CompanySchema.statics.removeCompanies = async function(this:Model<ICompanyDocument>) {
    this.remove();
    return "";
}

// 회사명으로 회사 코드 찾기 
CompanySchema.statics.findCompany = async function(this:Model<ICompanyDocument>, companyName:string) {
    return this.findOne({companyName});
}

const CompanyModel = mongoose.model<ICompanyDocument, ICompanyModel>("company", CompanySchema);

export default CompanyModel;