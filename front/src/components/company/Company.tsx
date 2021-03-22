import React, { FormEvent, useEffect } from 'react'
import './../../sass/style.scss'
import Card from './Card'
import refresh from '../../images/png/png_line_refresh.png';
import Input from '../common/Input';
import Button from '../common/Button';
import {useDispatch, useSelector} from 'react-redux'
import {cCodeList, searchComp} from '../../modules/company'
import {RootState} from '../../modules'
import {withRouter, RouteComponentProps} from 'react-router-dom'


const Company: React.FC<RouteComponentProps> = ({ history }:RouteComponentProps) => {
    const dispath = useDispatch();
    let searchKeyword:string = "";

    const {codeListError, company} = useSelector(({company}: RootState) => ({
        codeListError: company.codeListError,
        company: company.companies
    }))

    // 멘유 이동 클릭 이벤트
    const onBoardClick = (e: React.MouseEvent<HTMLUListElement>) => {
        // e.target.classList 로 접근하게 되면 e.target 의 타입을 지정하지 않아서 오류 발생
        // HTMLUListElement 타입으로 선언해주면 기존의 내장 함수들을 사용할 수 있다.
        const $target = (e.target as HTMLUListElement);
        const $menuList = document.getElementsByClassName("tab_title")[0].querySelectorAll("ul > li");
        const hasClass = $target.classList.contains("on");
        const $menu_line = document.getElementById("menu_line") as HTMLUListElement;

        if (!hasClass) {
            let clickIndex = -1;
            for (let i = 0 ; i < $menuList.length ; i++) {
                const $el = $menuList[i] as HTMLUListElement;

                $el.classList.remove("on");

                if ($el === $target) {
                    clickIndex = i;
                }
            }

            // 선택한 탭으로 라인 이동
            const moveLine = ($menu_line.offsetWidth * clickIndex) + "px";

            $target.classList.add("on");
            $menu_line.style.left = moveLine;
        }
    }

    // 회사코드 최신화
    const onUpdateCode = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();

        dispath(cCodeList());
    }

    useEffect(() => {
        if (codeListError) {
            console.log("회사코드 최신화에 실패했습니다.");
        }
        else {
            console.log("회사코드가 최신화 되었습니다.");
        }

    },[codeListError])

    useEffect(() => {
        if (company) {
            console.log("company", company);

            history.push("/search");
        }
    },[company])

    // 회사 검색 이벤트
    const onSearchCo = (e: React.MouseEvent<HTMLButtonElement>) => {
       dispath(searchComp(searchKeyword));
    }

    // search text change event
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>) => {
        searchKeyword = (e.target as HTMLInputElement).value;
    }

    // 회사검색 enter처리
    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            dispath(searchComp(searchKeyword));
        }
    }

    // 회사 상세 조회
    const onClickForDetail = (e: React.MouseEvent<HTMLLIElement>) => {
        const $ul = document.getElementById("warpCard") as HTMLUListElement;    // 회사 목록 영역
        const detailArea = document.getElementById("contentDetail") as HTMLDivElement;  // 상세내용 영역
        
        if ($ul.classList.contains("content_selected")) {
            // 상세보기 닫기
            $ul.classList.remove("content_selected");
            detailArea.style.display = "none";

            displayCompany(true);
        }
        else {
            // 상세보기

            // 선택한 회사를 제외한 나머지 숨김
            displayCompany(false);
            e.currentTarget.style.display = "block";

            $ul.classList.add("content_selected");
            detailArea.style.display = "contents";
        }
    }

    // 회사 목록 show/hide
    const displayCompany = (isDisplay: boolean) => {
        const $lis = (document.getElementById("warpCard") as HTMLUListElement).children;

        for (let i = 0 ; i < $lis.length ; i++) {
            const $li = ($lis.item(i) as HTMLLIElement);

            $li.style.display = isDisplay ? "block" : "none";
        }
    }

    return (
        <>
            <div className="bg"></div>
            <div className="logo">
                <a href="index.html"><img src="images/logo.png" alt=""/></a>
            </div>
            <div className="content">
                <div className="icon_wrap on">
                    <div>
                        <img className="one-botton" src={refresh} onClick={onUpdateCode}/>
                    </div>
                    <div className="search_wrap">
                        <div className="search_box">
                            <Input  type="text" placeHolder="키워드를 입력해주세요." onChange={onChangeKeyword} onKeyPress={onKeyPress}/>
                            <Button onClick={onSearchCo}></Button>
                        </div>
                    </div>
                    <div className="tab_title">
                        <ul onClick={onBoardClick}>
                            <li className="on">최근 검색</li>
                            <li>즐겨찾기</li>
                            <li id="menu_line" className="line"></li>
                        </ul>
                    </div>
                    <div className="wrp_tab_content">
                        <ul id="warpCard" className="tab_content">
                            <Card 
                                onClick={onClickForDetail}
                                key={1}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={2}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={3}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={4}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={5}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={6}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                             <Card 
                                key={7}
                                companyName={"company name"} 
                                companyCode={"companyCode"}
                            />
                        </ul>
                        <div id="contentDetail" className="content_detail"> 상세 조회 영역</div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default withRouter(Company);