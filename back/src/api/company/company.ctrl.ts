import { Context } from 'koa'
import CompanyModel, {ICompanyDocument} from '../../models/company'
import mongoose from 'mongoose'
import Joi, { number, object, StringRegexOptions } from 'joi'
import fs from 'fs'
import StreamZip, { async } from 'node-stream-zip' // zip 파일 관련 lib
import xml2js from 'xml2js' // xml parser
import { callApi } from '../../lib/callApi'
import {IApi, IApiReturn, IWaningFinc, IIsbuy} from '../../lib/interfaces/IApi'
import {getDateYYYYMMDD} from '../../lib/common'
import getHtml from './crawlingFcguide'
import cheerio from 'cheerio'
import { v4 as uuidv4} from 'uuid'
import { AnyARecord } from 'node:dns'

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

export const test = async (ctx: Context) => {
  console.log("start update");

  const tempCompany = await CompanyModel.findOne({stockCode: "005930"}); 

  console.log(tempCompany?._id);

  const udpate = await CompanyModel.findByIdAndUpdate(tempCompany?._id, {'isBuy': false}, {upsert: true}).exec();
  //const update = await CompanyModel.findByIdAndUpdate(_id, {"searchType": searchType, "searchDate": new Date()}, {upsert:true}).exec();
  // findByIdAndUpdate(_id, {"searchType": searchType, "searchDate": new Date()}, {upsert:true}).exec();


  if (udpate) {
    const company = await CompanyModel.findById(tempCompany?._id);
    console.log(company);  
  }
  

  ctx.status = 200;
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

            if (stockCode.trim() != "") {
              const company = new CompanyModel({companyName, companyCode, stockCode})

              company.save();
            }
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

    const update = await CompanyModel.findByIdAndUpdate(_id, {"searchType": searchType, "searchDate": new Date()}, {upsert:true}).exec();

    if (!update) {
      ctx.throw(500, "최근 검색 기록 저장에 실패했습니다.")
      return;
    }

    const company:ICompanyDocument | null = await CompanyModel.findById(_id);

    const companyCode = company !== null ? company.companyCode: "";
    const stockCode:string = company !== null ? company.stockCode: "";

    // let searchYear:number = new Date().getFullYear();

    // let initRow:IApiReturn = {
    //   returnData: [], 
    //   financeInfo: [],
    //   priceInfo: {},
    //   riskInfo: [],
    //   message: ''
    // } 

    // // 현재년도 (기준) 조회
    // /**
    //  * dart api로는 현재주가, 발행 주식수를 알 수 없다.
    //  * */
    // initRow = await callFinanceApi(companyCode, searchYear);

    // searchYear = searchYear - 1;

    // // 현재 년도에 조회가 안되는경우
    // if (initRow.returnData.length === 0) {
    //   initRow = await callFinanceApi(companyCode, searchYear);
    // }

    // if (initRow.returnData.length > 0) {
    //   while(searchYear > 2015) {
    //     searchYear = searchYear - 1;
  
    //     const {returnData, message} = await callFinanceApi(companyCode, searchYear);
  
    //     initRow.returnData.map((row: any) => {
    //       returnData.map((fRow:any) => {
    //         if (fRow.account_nm.indexOf(row.account_nm) > -1) {
    //           row.data.push(fRow.data[fRow.data.length-1])
    //         }
    //       })
    //     })
    //   }
    // }
     
    // initRow.riskInfo = checkWaning(initRow.returnData);

    // /**
    //  * fn 가이드 크롤링
    //  * 종가                  - 시세현황 
    //  * 발행주식수 (보통주)    - 시세현황 
    //  * 시가 총액              - 시세현황 
    //  * 
    //  * 지배주주지분           - 최하단
    //  * ROE                   - 최하단
    //  * EPS                   - 최하단
    //  * BPS                   - 최하단
    //  * PER                   - 최하단
    //  * PBR                   - 최하단
    //  * 
    //  * 배당 수익율            - 최상단
     
    //  */
    // const financeData:any[] = [];
    // const detailInfo = {
    //   stock: 0,
    //   shares: 0,
    //   roe: 0,
    //   bps: 0
    // }
    // await getHtml(stockCode)
    //   .then(html => {
    //     if (html) {
    //       const $ = cheerio.load(html.data);
    //       const $wrapDiv = $('#corp_group2') // TODO : 모든 하위 엘리먼트를 찾는 문제로 바로 자식들만 접근할 수 있는 방법을 찾아야 한다.

    //       // 배당 수익율 가져오기
    //       $wrapDiv.children().each((index: number, element: any)=> {
    //         if (index === 4) {
    //           //financeData.divid = $((element.children[3] as HTMLElement)).text();
    //           const tempObj = {
    //             _id: uuidv4(),
    //             key: "배당 수익율",
    //             value: $((element.children[3] as HTMLElement)).text()
    //           }

    //           financeData.push(tempObj);
    //           console.log("======================================="); // 배당 수익율
    //         }
    //       })

    //       // 종가, 발행주식수, 시가 총액
    //       const $rates = $("#svdMainGrid1 table tbody").find("tr");

    //       $rates.each((index: number , element: any) => {
    //         const key = $((element as HTMLElement)).find("div").eq(0).text();
    //         let value = $((element as HTMLElement)).find("td").eq(0).text();
    //         value = (value.split("/")[0]).replace(/,/gi, '');
    //         const key2 = $((element as HTMLElement)).find("div").eq(1).text();
    //         let value2 = $((element as HTMLElement)).find("td").eq(1).text();
    //         value2 = (value2.split("/")[0]).replace(/,/gi, '')

    //         const tempObj = {
    //           _id: uuidv4(),
    //           key: "",
    //           value: value
    //         }
    //         const tempObj2 = {
    //           _id: uuidv4(),
    //           key: "",
    //           value: value2
    //         }

    //         switch (index) {
    //           case 0 :
    //             // 0 : 종가, 1: 거래량 
    //             tempObj.key = "종가"
    //             tempObj2.key = "거래량"
    //             financeData.push(tempObj);
    //             financeData.push(tempObj2);
    //             // financeData.price = (value.split("/")[0]).replace(/,/gi, '');
    //             // // financeData.volume = value2.replace(/,/gi, '');
    //             // console.log(key + "   " + value);
    //             // console.log(key2 + "   " + value2);
    //             // console.log("===========================");
    //             break;
    //           case 4 : 
    //             tempObj.key="시가 총액"
    //             financeData.push(tempObj);
    //             // financeData.total = value.replace(/,/gi, '');
    //             // console.log(key + "   " + value);
    //             // console.log("===========================");
    //             // 0 : 보통주 시가총액
    //             break;
    //           case 6 : 
    //             tempObj.key="발행 주식수"
    //             financeData.push(tempObj);
    //             detailInfo.stock = parseInt(value);
    //             // financeData.stock = (value.split("/")[0]).replace(/,/gi, '');
    //             // console.log(key + "   " + value);
    //             // console.log("===========================");
    //             // 0: 발행 주식수
    //            break;
    //         }
    //       })

    //       // 지배주주지분, ROE, EPS, BPS, PER, PBR
    //       const $finance = $("#div15 table tbody").find("tr");

    //       const tempObj = {
    //         "9": "share",
    //         "12": "debt",
    //         "17": "ROE",
    //         "18": "EPS",
    //         "19": "BPS",
    //         "21": "PER",
    //         "22": "PBR"
    //       }

    //       $finance.each((index: number, element: any) => {
    //         /**
    //          * 9 : 지배주주 지분
    //          * 17: ROE
    //          * 18: EPS
    //          * 19: BPS
    //          * 21: PER
    //          * 22: PBR
    //          */
    //          switch (index) {
    //           case 9 :
    //           case 12 :
    //           case 17 :
    //           case 18 :
    //           case 19 :
    //           case 21 :
    //           case 22 :
    //             const key = $((element as HTMLElement)).find("span.txt_acd").text();
    //             const value = $((element as HTMLElement)).find("td.tdbg_b").text();
    //             // financeData[tempObj[index]] = value.replace(/,/gi, '');
    //             const objKey = tempObj[index];

    //             const obj = {
    //               _id: uuidv4(),
    //               key: index === 9 ? "지배 주주 지분": (index === 12 ? "부채 비율" : tempObj[index]),
    //               value: value
    //             }

    //             if (index === 9) detailInfo.shares = parseInt(value.replace(/,/gi, ''))
    //             if (index === 17) detailInfo.roe = parseFloat(value)
    //             if (index === 19) detailInfo.bps = parseInt(value.replace(/,/gi, ''))
                
    //             financeData.push(obj);
    //            break;
    //         }
    //       });
    //     }
    //   })

    // initRow.financeInfo = financeData;
    
    // // 우량주 여부 확인 
    // initRow.checkBuy = checkStock(initRow);

    // const s_rim8 = ((detailInfo.shares + (detailInfo.shares * (detailInfo.roe - 8))/8)/detailInfo.stock * 100000000).toFixed(0);
    // const s_rim7 = ((detailInfo.shares + (detailInfo.shares * (detailInfo.roe - 7))/7)/detailInfo.stock * 100000000).toFixed(0);
    // const prePrice8 = (detailInfo.bps * (detailInfo.roe/100)/0.08).toFixed(0)
    // const prePrice7 = (detailInfo.bps * (detailInfo.roe/100)/0.07).toFixed(0)

    // initRow.priceInfo ={
    //   s_rim8,
    //   s_rim7,
    //   prePrice8,
    //   prePrice7
    // }
    const initRow = await findFinance(companyCode, stockCode, false);
    //findStock();

    // console.log("result >>>>>", initRow);

   //callFinanceInfo(companyCode);

    ctx.status = 200;
    ctx.body = initRow;

  } catch (e) {
    ctx.throw(500, e.message)
  }
}

/**
 * 재무정보 조회
 */
export const findFinance = async (companyCode: string, stockCode: string, isFindBlueChip: boolean) => {
  let searchYear:number = new Date().getFullYear();

  let initRow:IApiReturn = {
    returnData: [], 
    financeInfo: [],
    priceInfo: {},
    riskInfo: [],
    message: ''
  } 

  // 현재년도 (기준) 조회
  /**
   * dart api로는 현재주가, 발행 주식수를 알 수 없다.
   * */
  if (!isFindBlueChip) {
    initRow = await callFinanceApi(companyCode, searchYear);

    searchYear = searchYear - 1;

    // 현재 년도에 조회가 안되는경우
    if (initRow.returnData.length === 0) {
      initRow = await callFinanceApi(companyCode, searchYear);
    }

    if (initRow.returnData.length === 0) {
      while(searchYear > 2015) {

        //console.log("initRow.returnData.length", initRow.returnData.length, searchYear);
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
  }
    
  //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>",initRow.returnData);
  // if (initRow.returnData.length === 0) {
  //   // fn

  //   const nullIsbuy:IIsbuy = {
  //     isBuy: false,
  //     message: '재무상태 조회 불가'
  //   }
  //   initRow.checkBuy = nullIsbuy
  //   return initRow
  // }

  if (initRow.returnData.length > 0) {
    console.log("initRow.returnData not index 0 ", initRow.returnData.length);

    initRow.riskInfo = checkWaning(initRow.returnData);  
  }

  console.log("?? " , initRow.returnData.length);

  /**
   * fn 가이드 크롤링
   * 종가                  - 시세현황 
   * 발행주식수 (보통주)    - 시세현황 
   * 시가 총액              - 시세현황 
   * 
   * 지배주주지분           - 최하단
   * ROE                   - 최하단
   * EPS                   - 최하단
   * BPS                   - 최하단
   * PER                   - 최하단
   * PBR                   - 최하단
   * 
   * 배당 수익율            - 최상단
   
    */
  const financeData:any[] = [];
  const detailInfo = {
    stock: 0,
    shares: 0,
    roe: 0,
    bps: 0
  }

  const tempRetrunData:any = [];

  await getHtml(stockCode)
    .then(html => {
      if (html) {
        const $ = cheerio.load(html.data);
        const $wrapDiv = $('#corp_group2') // TODO : 모든 하위 엘리먼트를 찾는 문제로 바로 자식들만 접근할 수 있는 방법을 찾아야 한다.

        // 배당 수익율 가져오기
        $wrapDiv.children().each((index: number, element: any)=> {
          if (index === 4) {
            //financeData.divid = $((element.children[3] as HTMLElement)).text();
            const tempObj = {
              _id: uuidv4(),
              key: "배당 수익율",
              value: $((element.children[3] as HTMLElement)).text()
            }

            financeData.push(tempObj);
            console.log("======================================="); // 배당 수익율
          }
        })

        // 종가, 발행주식수, 시가 총액
        const $rates = $("#svdMainGrid1 table tbody").find("tr");

        $rates.each((index: number , element: any) => {
          const key = $((element as HTMLElement)).find("div").eq(0).text();
          let value = $((element as HTMLElement)).find("td").eq(0).text();
          value = (value.split("/")[0]).replace(/,/gi, '');
          const key2 = $((element as HTMLElement)).find("div").eq(1).text();
          let value2 = $((element as HTMLElement)).find("td").eq(1).text();
          value2 = (value2.split("/")[0]).replace(/,/gi, '')

          const tempObj = {
            _id: uuidv4(),
            key: "",
            value: value
          }
          const tempObj2 = {
            _id: uuidv4(),
            key: "",
            value: value2
          }

          switch (index) {
            case 0 :
              // 0 : 종가, 1: 거래량 
              tempObj.key = "종가"
              tempObj2.key = "거래량"
              financeData.push(tempObj);
              financeData.push(tempObj2);
              break;
            case 4 : 
              tempObj.key="시가 총액"
              financeData.push(tempObj);
              // 0 : 보통주 시가총액
              break;
            case 6 : 
              tempObj.key="발행 주식수"
              financeData.push(tempObj);
              detailInfo.stock = parseInt(value);
              // 0: 발행 주식수
              break;
          }
        })

        // 지배주주지분, ROE, EPS, BPS, PER, PBR
        const $finance = $("#div15 table tbody").find("tr");

        const tempObj = {
          "9": "share",
          "12": "debt",
          "17": "ROE",
          "18": "EPS",
          "19": "BPS",
          "21": "PER",
          "22": "PBR"
        }
        $finance.each((index: number, element: any) => {
          /**
           * 9 : 지배주주 지분
           * 17: ROE
           * 18: EPS
           * 19: BPS
           * 21: PER
           * 22: PBR
           */
            switch (index) {
            case 9 :
            case 12 :
            case 17 :
            case 18 :
            case 19 :
            case 21 :
            case 22 :
              const key = $((element as HTMLElement)).find("span.txt_acd").text();
              const value = $((element as HTMLElement)).find("td.tdbg_b").eq(0).text();
              // financeData[tempObj[index]] = value.replace(/,/gi, '');
              const objKey = tempObj[index];

              const obj = {
                _id: uuidv4(),
                key: index === 9 ? "지배 주주 지분": (index === 12 ? "부채 비율" : tempObj[index]),
                value: value
              }

              if (index === 9) detailInfo.shares = parseInt(value.replace(/,/gi, ''))
              if (index === 17) detailInfo.roe = parseFloat(value)
              if (index === 19) detailInfo.bps = parseInt(value.replace(/,/gi, ''))
              
              console.log();

              financeData.push(obj);
              break;
            case 1: 
            case 0: 
            case 3:
              // 영업이익
              const tds = $((element as HTMLElement)).find("td");
              const tempFineData:any[] = [];
              tds.map((idx:number, element: any) => {
                if (idx < 4) {
                  const tempData2 = {        
                    name: index === 1 ? "영업이익": "당기순이익",
                    amount: $((element as HTMLElement)).text().replace(/,/gi, '')
                  }
                  tempFineData.push(tempData2) 
                }
              })

              const accountId = index === 1 ? 'sales' : index === 0 ? 'profits' : 'netProfit';  
              const accountNm = index === 1 ? 'dart_OperatingIncomeLoss' : index === 0 ? 'ifrs-full_ProfitLoss' : 'ifrs-full_ProfitLoss';

              const tempObj2 = {
                account_id: accountId,
                account_nm: accountNm,
                data: tempFineData
              }
              
              tempRetrunData.push(tempObj2)
              console.log("tempObj2", tempObj2);
              break
          }
        });
      }
    })

  // dart 조회가 안되는경우 fnguidenet 에서 재무정보 조회
  if (initRow.returnData.length === 0) {
    initRow.returnData = tempRetrunData
  }

  initRow.financeInfo = financeData;
  
  // 우량주 여부 확인 
  if (initRow.returnData.length > 0) {
    initRow.checkBuy = checkStock(initRow);
  }

  const s_rim8 = ((detailInfo.shares + (detailInfo.shares * (detailInfo.roe - 8))/8)/detailInfo.stock * 100000000).toFixed(0);
  const s_rim7 = ((detailInfo.shares + (detailInfo.shares * (detailInfo.roe - 7))/7)/detailInfo.stock * 100000000).toFixed(0);
  const prePrice8 = (detailInfo.bps * (detailInfo.roe/100)/0.08).toFixed(0)
  const prePrice7 = (detailInfo.bps * (detailInfo.roe/100)/0.07).toFixed(0)

  initRow.priceInfo ={
    s_rim8,
    s_rim7,
    prePrice8,
    prePrice7
  }

  console.log("initRow", initRow);

  return initRow
}

/**
 * 위험도 계산    initRow.returnData
 */
const checkWaning = (finRow: any[]): IWaningFinc[] => {
      /**
     * 2 매출액 50억원 미만 1 회 : 관리, 2회 : 상폐
     * 3 영업손신 3회 : 관리 , 4회 상폐
     * 자본잠식 50% 1회 : 관리, 2회 상폐
     * 
     */

    console.log("checking warning :::: ", finRow)

    /** 
     * 매출액 계산  profits
     */
    const profitsObj:IWaningFinc = {
      status: 0,
      message:''
    }
    const profits = (finRow || []).filter((row: any) => row.account_id === "profits")
    let lessThanCount = 0;

    console.log("profits", profits);

    profits[0].data.map((row: any) => {
      if (row.amount < 5000000000) {
        lessThanCount++;
      }
    })

    if (lessThanCount === 1) {
      profitsObj.status = 1;
      profitsObj.message = '매출액 50억원 미만으로 관리종목 등록' 
    } else if (lessThanCount === 2) {
      profitsObj.status = 2;
      profitsObj.message = '매출액 50억원 2회 미만으로 상장폐지' 
    } 

    /**
     * 영업이익 계산  sales
     */
    const salesObj:IWaningFinc = {
      status: 0,
      message:''
    }
    const sales = (finRow || []).filter((row: any) => row.account_id === "profits")
    let minusCount = 0;
console.log("sales", sales);
    sales[0].data.map((row: any) => {
      if (row.amount < 0) {
        minusCount++;
      } else {
        minusCount = 0;
      }
    })

    if (minusCount === 2) {
      salesObj.status = 1;
      salesObj.message = '2회연속 영업이익 적자로 인한 관리종목 등록 위험' 
    } else if (minusCount >= 3) {
      salesObj.status = 2;
      salesObj.message = '3회이상 연속 영업이익 적자로 인한 상장페지 등록 위험' 
    } 


    /**
     * 자본 잠식 계산 
     * 
     * 자본이 자본금 보다 적은경우
      (자본금 - 자본)/자본금 * 100 = 잠식률
     *  */ 
      const encroachObj:IWaningFinc = {
        status: 0,
        message:''
      }
      let encroachCount = 0;
  
      

      const issuedCapital = (finRow || []).filter((row:any) => row.account_id === "issuedCapital"); // 자본금
      console.log("issuedCapital", issuedCapital);
      const capital = (finRow || []).filter((row:any) => row.account_id === "capital");   // 자본 총계
      console.log("capital", capital);
      issuedCapital[0].data.map((iRow:any, index:number) => {
        //console.log(iRow.amount, capital[0].data[index].amount);
        const issueAmount = iRow.amount;
        const capitalAmount = capital[0].data[index].amount;
  
        if (issueAmount > capitalAmount) {
          const aggre = (issueAmount - capitalAmount)/issueAmount * 100;
  
          if (aggre >= 50 && aggre < 100) {
            encroachCount++
          } else if (aggre >= 100) {
            encroachCount = 100;
          }
          
        }
      });
  
      if (encroachCount === 1) {
        encroachObj.status = 1;
        encroachObj.message = '50% 이상 자본잠식으로 인한 관리종목 등록(상장폐지위험)';
      } else if (encroachCount === 2) {
        encroachObj.status = 2;
        encroachObj.message = '50% 이상 자본잠식 2회로 인한 상장폐지';
      } else if (encroachCount >= 100) {
        encroachObj.status = 2;
        encroachObj.message = '100% 이상 자본잠식';
      }

      const riskInfo: IWaningFinc[] = [];

      riskInfo.push(profitsObj);
      riskInfo.push(salesObj);
      riskInfo.push(encroachObj);

      return riskInfo;
}


/**
 * 우량주 여부 확인
 */
const checkStock = (initRow: IApiReturn):IIsbuy => {
   let isBuy = false  // 구매여부
   let message = '' // 탈락 여부

  //returnData    financeInfo
    // 영업 이익 확인 : 영업이익이 전년도 보다 증가하거나 비슷한 수준( 5%미만)
    const sales = (initRow.returnData || []).filter((row: any) => row.account_id === "profits")
    let beforeSales = sales[0].data[0].amount
    let salseCount = 0;

    sales[0].data.map((row: any) => {
      if (beforeSales < row.amount) {
        beforeSales = row.amount
        salseCount++
      } else {
        if (row.amount/beforeSales >= 0.95) {
          salseCount++
        } else {
          salseCount = 0;
          message = '영업이익 5% 이상 감소'
        }
      }
    }) 

    if (salseCount > 4) isBuy = true  // 영업이익에 따른 구매여부

    // 순이익 확인  : 순이익이 적자가 없는경우
    const netProfit = (initRow.returnData || []).filter((row: any) => row.account_id === "netProfit")

    for (let row of netProfit[0].data) {
      if (row.amount < 0) {
        isBuy = false 
        message = '순이익 적자'
        break
      }
      else {
        isBuy = true
      }
    }

    const currntStock = (initRow.financeInfo || []).filter((row: any) => row.key === "종가")

    for (let row of (initRow.financeInfo || [])) {
      const key = row.key
      const value = row.value

      switch (key) {
        case "debt":  // 부채 비율 확인: 부채비율 100% 이하
          if (value < 100) {
            isBuy = true
          }
          else {
            isBuy = false
            message = '부채비율 100% 이상'
          }
          break
        case "PER": // PER 확인: per 15 이하
          if (value < 16) {
            isBuy = true
          }
          else {
            isBuy = false
            message = 'PER 16 이상'
          }
          break
        case "BPS": // BPS 확인: bps 가 현재 주가보다 높은것
          if (currntStock[0].value <= value) {
            isBuy = true
          }
          else {
            isBuy = false
            message = 'BPS가 현재 주가보다 낮음'
          }
          break
        case "ROE": // ROE 확인: roe 5% 이상
          if (value > 5) {
            isBuy = true
          }
          else {
            isBuy = false
            message = 'ROE 5% 이하'
          }
          break
        case "시가 총액": // 시가총액 확인: 1조 이상
          if (value > 10000) {
            isBuy = true
          }
          else {
            isBuy = false
            message = '시가총액 1조원 미만'
          }
          break
      }

      if (isBuy === false) {
        break
      }
      // per 확인
    }

    const buyObj:IIsbuy = {
      isBuy,
      message
    } 
    
    return buyObj
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
      if (row.report_nm.indexOf("사업보고서") > -1) {
        const {report_nm, rcept_no}:TFinanceType = row;
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
    reprt_code: "11011",
    fs_div: "CFS"
  }

  let returnData:any[] = []
  let message =''

  const params: IApi = {url: companyListUrl, resType:"JSON", data: apiParms};

  try {
    const {type, rows} = await callApi(params);

    if (type) {
      /**
       *                                              account_id
       * 
       * "account_nm": "매출액”,                        ifrs-full_Revenue
          "account_nm": "영업이익",                     dart_OperatingIncomeLoss
          "account_nm": "당기순이익"                    ifrs-full_ProfitLoss
          "account_nm": "자본총계"                      ifrs-full_Equity
          "account_nm": “부채총계"                      ifrs-full_Liabilities
          "account_nm": 자본금"                         ifrs_IssuedCapital
          ROE(%) : 당기순이익 / 자본총액 * 100
          부채율(%) : 부채총계 / 자본총계 * 100


       *  */  

      let accountId:string = '';
      
      // console.log("companyCode", companyCode, searchYear);
      if (rows.status !== '000') {
        message = rows.message
      
        return {returnData, message}
      }

      rows.list.map((row: any, index: number) => {
        switch (row.account_nm) {
          case "수익(매출액)":   // 매출액   frmtrm_q_nm   frmtrm_q_amount
          case "매출액":
            if (row.account_nm === "매출액") {
              if (row.account_id !== "ifrs-full_Revenue" ) {
                break;
              }
            }
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
          case "자본금":
            accountId = 'issuedCapital';
            returnData.push(setDataSet(row, "frmtrm_nm", "frmtrm_amount", accountId));
            break;
        }   
      })
    } else {
      console.log("API 호출에 실패했습니다.");
    }
  } catch (e) {
    console.log("??",e.message);
  }
  
  const returnValue: IApiReturn = {returnData,  message};

  return returnValue;
}

// 재무제표 데이터 셋팅
const setDataSet = (row:any, nameCol:string, amountCol:string, accountId:string):any => {
   // 현재
   const tempData1 = {
    name: row.thstrm_nm,
    amount: row.thstrm_amount/100000000
  }

  // -1
  const tempData2 = {
    name: row[nameCol],
    amount: row[amountCol]/100000000
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