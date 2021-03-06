import { Context } from 'koa'
import CompanyModel, {ICompanyDocument} from '../../models/company'
import mongoose from 'mongoose'
import Joi from 'joi'
import fs from 'fs'
import StreamZip from 'node-stream-zip' // zip 파일 관련 lib
import xml2js from 'xml2js' // xml parser
import { callApi } from '../../lib/callApi'
import {IApi, IApiReturn} from '../../lib/interfaces/IApi'
import {getDateYYYYMMDD} from '../../lib/common'



// 재무제표 api 호출 type
type TFinanceType = {
  report_nm: string,
  rcept_no: string
}

/**
 * api key
 */
const apiKey = 'b2204000663822f8a99d3e68611b5e0fa1721af1';

/**
 * 권한 확인
 */
const {ObjectId} = mongoose.Types

export const getCompanyById = async(ctx: Context, next: () => void) => {
  
  const {id} = ctx.params;
  if (!ObjectId.isValid(id)) {
      ctx.status = 401;
      ctx.body = "접근 권한이 없습니다."
      return;
  }

  try {
      const company = await CompanyModel.findById(id);

      if (!company) {
          ctx.status = 404;
          ctx.body = "존재하지 않는 정보 입니다."
          return;
      }

      return next()
  } catch(e) {
      ctx.throw(500, e)
  }
}

export const selectCompany = async (ctx: Context) => {
    const schema = Joi.object().keys({
        companyName: Joi.array().items(Joi.string()).required(),
        companyCode: Joi.array().items(Joi.string()).required(),
        search_start_dt: Joi.date().required(),
        search_end_dt: Joi.date().required()
    })

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 401
        ctx.body = result.error
        return
    }

    const {companyName, companyCode, search_start_dt, search_end_dt} = ctx.request.body

    const company = new CompanyModel({companyName, companyCode, search_start_dt, search_end_dt, user: ctx.state.user});

    try {
        await company.save()
        ctx.body = company
    }
    catch(e) {
        ctx.throw(500, e)
    }
}


// 회사 코드 api 호출
export const callCodeApi = async (ctx: Context) => {
  const companyListUrl = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${apiKey}`

  console.log("call conpany code api");

  const params: IApi = {url: companyListUrl, resType:"arraybuffer"};

  const {type, rows} = await callApi(params);

  if (type) {
     // 기존 파일 삭제
    console.log("remove old companies info");

    const fileName = 'data/companys.zip';
    const outputFileName: string = "CORPCODE.xml";

    fs.writeFile(fileName, rows, (err) => {
      if (err) {
        console.log(err);
        ctx.throw(500, err.message)
      }
      else {
        // 기존 파일 삭제
        console.log("remove old companies info");
        CompanyModel.deleteMany({});

        console.log("success call api");

        fileReadXml(fileName, outputFileName);
      }
    })
  } else {
    ctx.throw(500, "API 호출에 실패했습니다.")
  }

  ctx.status = 200;
  ctx.body = "SUCCESS"

  // await axios({url: companyListUrl, method: "GET", responseType:"arraybuffer"})
  //   .then(response => {
  //     fs.writeFile('data/companys.zip', response.data,(err) => {
  //       if (err) {
  //         console.log(err);
  //         ctx.throw(500, err.message)
  //       }
  //       else {
  //         // 기존 파일 삭제
  //         console.log("remove old companies info");
  //         CompanyModel.deleteMany({});

  //         console.log("success call api");

  //         fileReadXml();
  //       }
  //     })

  //   })
  //   .catch(e => {
  //     console.log(e.message);
  //     ctx.throw(500, e.message)
  //   })

}

const fileReadXml = async (fileName:string, outputFileName: string) => {
  // zip파일 압출풀지 않고 내용만 확인 하는 방법

  // zip 파일
  const zip = new StreamZip({file: fileName, storeEntries:true});

  zip.on('ready', () => {
    // zip 파일안에 CORPCODE.xml 내용
    let zipContent = zip.entryDataSync(outputFileName).toString('utf8');

    // xml parser
    const parser = new xml2js.Parser();
    
    // xml to object
    parser.parseString(zipContent, (err: Error, result:any) => {
      if(err) {
        console.log(err);
      }
      else {
        const companyList = result.result.list;
        
        console.log("start save companies infos ::" , companyList.length);

        try {
          // TODO: 파일에 따른 태그 처리 
          // object 형식의 데이터 확인
          companyList.map((row:any, index:number) => {
            const {corp_name, corp_code, stock_code, modify_date} = row;

            const companyName: string = corp_name[0];
            const companyCode: string = corp_code[0];
            const stockCode: string =  stock_code[0];

            const company = new CompanyModel({companyName, companyCode, stockCode})

            company.save();
            
          })
        }
        catch (e) {
          console.log("save Failure");
        }
        
        console.log("save complate");
      }
    })

    zip.close();
  })
}

// 회사 코드검색
export const search = async (ctx: Context) => {
  const {companyName} = ctx.request.body;

  console.log("companyName >>> ", companyName);

  const searchName = companyName
  // const query:any = searchType ? {'companyName': { $regex: companyName }, 'searchType': searchType }
  //   :  {'companyName': { $regex: companyName }}; // like 검색을 위해서 $regex를 사용한다.

   const query:any = {'companyName': { $regex: searchName }}; // like 검색을 위해서 $regex를 사용한다.
  //const query:any = {'companyName': companyName}; // like 검색을 위해서 $regex를 사용한다.

  
  try {
    const company = await CompanyModel.findCompany(query);


    console.log(company);

    // company {
    //   _id: 6052a9cf9815e34470abddef,
    //   companyName: '삼성전자',
    //   companyCode: '00126380',
    //   stockCode: '005930',
    //   __v: 0
    // }

    // 검색된 회사들 리턴
  
    ctx.status = 200;
    ctx.body = company;


    // 회사 공시정보 조회를 위한 파라미터 설정
    // const apiParms = {
    //   crtfc_key: apiKey,
    //   corp_code: company.companyCode,
    //   bgn_de: sDate,
    //   end_de: eDate,
    //   pblntf_ty: 'A'
    // }

    // 최근 검색기록 저장
    //await saveSearchLog();

    // await callFinanceInfo(apiParms);


  } catch (e) {
    console.log(e.message);
    ctx.throw(500, e.message);
  }
}
  
// 최근 검색기록 저장
export const saveSearchLogAndGetDetail = async (ctx: Context) => {
  try {
    const {_id, searchType} = ctx.request.body;

    console.log(_id, searchType);

    const update = await CompanyModel.findByIdAndUpdate(_id, {"searchType": searchType, "searchDate": new Date()}, {upsert:true}).exec();

    if (!update) {
      ctx.throw(500, "최근 검색 기록 저장에 실패했습니다.")
      return;
    }

    const company:ICompanyDocument | null = await CompanyModel.findById(_id);

    const companyCode = company !== null ? company.companyCode: "";

    let searchYear:number = new Date().getFullYear();

    let initRow:IApiReturn = {
      returnData: [], 
      message: ''
    } 

    // 현재년도 (기준) 조회
    initRow = await callFinanceApi(companyCode, searchYear);
    searchYear = searchYear - 1;

    // 현재 년도에 조회가 안되는경우
    if (initRow.returnData.length === 0) {
      initRow = await callFinanceApi(companyCode, searchYear);
    }

    if (initRow.returnData.length > 0) {
      while(searchYear > 2015) {
        searchYear = searchYear - 1;
  
        const {returnData, message} = await callFinanceApi(companyCode, searchYear);
  
        initRow.returnData.map((row: any) => {
          returnData.map((fRow:any) => {
            if (fRow.account_nm.indexOf(row.account_nm) > -1) {
              row.data.push(fRow.data[fRow.data.length-1])
            }
          })
        })
      }
    }

    console.log("result >>>>>", initRow);

   //callFinanceInfo(companyCode);

    ctx.status = 200;
    ctx.body = initRow;

  } catch (e) {
    ctx.throw(500, e.message)
  }
}

// 회사 사업보고서 api 호출
/*
*/
export const callFinanceInfo = async (companyCode: string) => {
  const apiUrl = "https://opendart.fss.or.kr/api/list.json";

  const sDate = getDateYYYYMMDD(-3, "Y", new Date());
  const eDate = getDateYYYYMMDD(0, "", new Date());

  const apiParms = {
    crtfc_key: apiKey,
    corp_code: companyCode,
    bgn_de: sDate,
    end_de: eDate,
    pblntf_ty: 'A'
  }

  const params: IApi = {url: apiUrl, resType: "JSON", data: apiParms};

  const {type, rows} = await callApi(params);

  if (type) {
    // 사업보고서만 추출
    const infoSet:TFinanceType[] = [];

    rows.list.map((row:any, index:number) => {
      console.log(row);

      if (row.report_nm.indexOf("사업보고서") > -1) {
        const {report_nm, rcept_no}:TFinanceType = row;
        console.log(rcept_no);
//        infoSet.push({report_nm, rcept_no});
      }
    })

  } else {
    return null;
  }

}

// 재무제표 api 호출 
const callFinanceApi = async (companyCode:string, searchYear:number): Promise<IApiReturn> => {
  const companyListUrl = `https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json`
  const apiParms = {
    crtfc_key: apiKey,
    corp_code: companyCode,
    bsns_year: searchYear,
    reprt_code: "11014",
    fs_div: "CFS"
  }

  let returnData:any[] = []
  let message =''
  console.log("call finance code api", apiParms);

  const params: IApi = {url: companyListUrl, resType:"JSON", data: apiParms};

  try {
    const {type, rows} = await callApi(params);

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", rows);

    if (type) {
      /**
       *                                              account_id
       * 
       * "account_nm": "매출액”,                        ifrs-full_Revenue
          "account_nm": "영업이익",                     dart_OperatingIncomeLoss
          "account_nm": "당기순이익"                    ifrs-full_ProfitLoss
          "account_nm": "자본총계"                      ifrs-full_Equity
          "account_nm": “부채총계"                      ifrs-full_Liabilities
          ROE(%) : 당기순이익 / 자본총액 * 100
          부채율(%) : 부채총계 / 자본총계 * 100


          /// 키움증권 api 참고
          EPS : 당기순이익 / 주식수
          PER : 현재주가 / EPS
          BPS : 자본총계 / 주식수
          PBR : 현재주가 / PBR


       *  */  

      let accountId:string = '';

      if (!rows.list) {
        message = rows.message
      }

      rows.list.map((row: any, index: number) => {
        switch (row.account_nm) {
          case "수익(매출액)":   // 매출액   frmtrm_q_nm   frmtrm_q_amount
            accountId = 'profits';
            returnData.push(setDataSet(row, "frmtrm_q_nm", "frmtrm_q_amount", accountId));
            break;
          case "영업이익":  // 영업이익   frmtrm_q_nm   frmtrm_q_amount
          case "영업이익(손실)":
            accountId = 'sales';
            returnData.push(setDataSet(row, "frmtrm_q_nm", "frmtrm_q_amount", accountId));      
            break
          case "부채총계": // 부채총계
            accountId = 'debt';
            returnData.push(setDataSet(row, "frmtrm_nm", "frmtrm_amount", accountId));      
            break
          case "당기순이익(손실)":
            if (row.account_nm === "당기순이익(손실)" && row.sj_div === "IS") {
              accountId = 'netProfit';
              returnData.push(setDataSet(row, "frmtrm_q_nm", "frmtrm_q_amount", accountId));
            }
            break;
          case "자본총계":
            if (row.account_nm === "자본총계") {
              accountId = 'capital';
              returnData.push(setDataSet(row, "frmtrm_nm", "frmtrm_amount", accountId));
            }

            break;
        }   
      })

      // returnData.map((row:any) => {
      //   console.log(">>>>>>>>>>>>>>>>>>>>>>>>",row);
      // });

    } else {
      console.log("API 호출에 실패했습니다.");
    }
  } catch (e) {
    console.log("??",e.message);
  }
  
  const returnValue: IApiReturn = {returnData, message};

  return returnValue;
}

// 재무제표 데이터 셋팅
const setDataSet = (row:any, nameCol:string, amountCol:string, accountId:string):any => {
   // 현재
   const tempData1 = {
    name: row.thstrm_nm,
    amount: row.thstrm_amount
  }

  // -1
  const tempData2 = {
    name: row[nameCol],
    amount: row[amountCol]
  }

  const tempObj = {
    // account_id: row.account_id,
    account_id: accountId,
    account_nm: row.account_nm,
    data: [tempData1, tempData2]
  }

  return tempObj;
}

// 재무제표 파일 읽기 및 저장
const getFinanceInfo = async () => {

}

// 검색한 회사의 재무제표 리턴
const returnFinance =  () => {

}

// 최근 검색 기록
export const latestSearch = async (ctx: Context) => {
  try {
    const query:any = {'searchType': 'C' }

    const companies = await CompanyModel.findCompany(query);

    if (!companies) {
      ctx.status = 404;
      ctx.body = "최근 검색된 회사가 없습니다."
    } else {
      ctx.status = 200;
      ctx.body = companies;
    }

  } catch (e) {
    ctx.throw(500, e.message)
  }
}