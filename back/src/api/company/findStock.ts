import {findFinance} from './company.ctrl'
import CompanyModel, {ICompanyDocument} from '../../models/company'
import {IApiReturn} from '../../lib/interfaces/IApi'
import schedule from 'node-schedule'

/**
 * 모든 상장된 회사를 돌면서 
 * 우량주 확인
 */
export const callFindBluChip = () => {
    console.log("callFindBluChip");
    let rule = new schedule.RecurrenceRule()
    rule.hour = 23;
    rule.minute = 0;

    const findBluChip = schedule.scheduleJob(rule, async() => {
        console.log("find blue chips");
    
        const allCompany = await CompanyModel.findAll();

        const searchDate = new Date()

        allCompany.map(async (row: any, index: number) => {
            const companyCode:string = row.companyCode
            const stockCode:string = row.stockCode

            if (index > searchDate.getMonth() * 120 && index < (searchDate.getMonth() + 1) * 120) {
                if (companyCode !== '' && stockCode !== '') {
                    //console.log("row ___________________________________________________________ ",row);
                    const stocks = await findFinance(companyCode, stockCode, true)
    
                    // 우량주인경우
                    if (stocks.checkBuy?.isBuy) {
                        console.log("push blue chip");
                        //const update = await CompanyModel.findByIdAndUpdate(_id, {"searchType": searchType, "searchDate": new Date()}, {upsert:true}).exec();
                        // await CompanyModel.findOne
                        const tempCompany = await CompanyModel.findOne({"stockCode":stockCode}); 

                        await CompanyModel.findByIdAndUpdate(tempCompany?._id, {'isBuy': false}, {upsert: true}).exec();
                    }
                    
                }
            }
            
        })

        
        // blueChips.map((row:any, index: number) => {
        //     if (index < 10) {
        //         console.log(row);
        //     }
        // })        
    });
}
