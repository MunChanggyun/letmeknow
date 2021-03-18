import { Context } from 'koa'
import CompanyModel from '../../models/company'
import mongoose from 'mongoose'
import Joi from 'joi'
import axios from 'axios'
import fs from 'fs'
import StreamZip from 'node-stream-zip' // zip 파일 관련 lib
import xml2js from 'xml2js' // xml parser
import { callApi } from '../../lib/callApi'
import {IApi} from '../../lib/interfaces/IApi'

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

    fs.writeFile('data/companys.zip', rows, (err) => {
      if (err) {
        console.log(err);
        ctx.throw(500, err.message)
      }
      else {
        // 기존 파일 삭제
        console.log("remove old companies info");
        CompanyModel.deleteMany({});

        console.log("success call api");

        fileReadXml();
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

const fileReadXml = async () => {
  // zip파일 압출풀지 않고 내용만 확인 하는 방법

  // zip 파일
  const zip = new StreamZip({file: 'data/companys.zip', storeEntries:true});

  zip.on('ready', () => {
    // zip 파일안에 CORPCODE.xml 내용
    let zipContent = zip.entryDataSync('CORPCODE.xml').toString('utf8');

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
  const {companyName, sDate, eDate} = ctx.request.body;

  try {
    const company = await CompanyModel.findCompany(companyName)

    // company {
    //   _id: 6052a9cf9815e34470abddef,
    //   companyName: '삼성전자',
    //   companyCode: '00126380',
    //   stockCode: '005930',
    //   __v: 0
    // }

    // 회사 공시정보 조회를 위한 파라미터 설정
    const apiParms = {
      crtfc_key: apiKey,
      corp_code: company.companyCode,
      bgn_de: sDate,
      end_de: eDate,
      pblntf_ty: 'F'
    }

    console.log("get company code ::: ", company);

    await companyInfo(apiParms);


  } catch (e) {
    console.log(e.message);
    ctx.throw(500, e.message);
  }

  ctx.status = 200;
}
  

// 회사 공시정보 조회
/*
  api : https://opendart.fss.or.kr/api/list.json
  crtfc_key	API 인증키
  corp_code	고유번호
  bgn_de	시작일  YYYYMMDD
  end_de	종료일  YYYYMMDD
  pblntf_ty	공시유형 : A
*/
export const companyInfo = async (apiParmas: any) => {
  console.log("call api params ::: " , apiParmas);

  const apiUrl = "https://opendart.fss.or.kr/api/list.json";

  const params: IApi = {url: apiUrl, resType: "JSON", data: apiParmas};

  const {type, rows} = await callApi(params);

  if (type) {
    console.log(rows);

    return rows;
  } else {
    return null;
  }

}
