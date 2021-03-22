import React, {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {RootState} from '../../modules'
import Input from '../common/Input';
import Button from '../common/Button';
import Card from './Card'
import {reSearchComp, saveSearchLog} from '../../modules/company'
import {CompanyType} from '../../types/CompanyType';

const SearchCompany: React.FC<RouteComponentProps> = ({history}: RouteComponentProps) => {
    let searchKeyword = "";
    const {company} = useSelector(({company}: RootState) => ({
        company: company.companies
    }))

    const dispatch = useDispatch();

    useEffect(() => {
        if (company) {
            console.log(company);
        } else {
            console.log("검색 결과가 없습니다.");
        }
    }, [company])

    // 회사 검색 이벤트
    const onSearchCo = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(reSearchComp(searchKeyword));
    }
 
    // search text change event
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>) => {
        searchKeyword = (e.target as HTMLInputElement).value;
    }

    // 회사검색 enter처리
    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            dispatch(reSearchComp(searchKeyword));
        }
    }

    // 검색기록 저장 및 세부내역 조회
    const onCLickForDetail = (index: number) => {
        // 검색 기록 저장
        const {_id} = (company || [])[index]; 
        
        const params:CompanyType = {_id, searchType:"C"};

        dispatch(saveSearchLog(params))
    }

    return (
        <>
            <div className="bg"></div>
            <div className="logo">
                <a href="index.html"><img src="images/logo.png" alt=""/></a>
            </div>
            <div className="content">
                <div className="icon_wrap on">
                    <div className="search_wrap">
                        <div className="search_box">
                            <Input  type="text" placeHolder="키워드를 입력해주세요." onChange={onChangeKeyword} onKeyPress={onKeyPress}/>
                            <Button onClick={onSearchCo}></Button>
                        </div>
                    </div>
                    <div className="tab_title">
                        <ul>
                            <li className="on">검색 결과</li>
                            <li id="menu_line" className="line"></li>
                        </ul>
                    </div>
                    <ul className="tab_content">
                        {company && (company || []).map((com: any, index:number) => (
                            <Card 
                                key={com._id}
                                onClick={() => onCLickForDetail(index)}
                                companyName={com.companyName} 
                                companyCode={com.companyCode}
                            />
                        ))}

                    </ul>
                </div>
            </div>
        </>
    )
};

export default withRouter(SearchCompany);