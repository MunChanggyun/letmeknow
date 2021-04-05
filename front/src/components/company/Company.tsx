import React, { FormEvent, useEffect, useState } from 'react'
import './../../sass/style.scss'
import Card from './Card'
import Finance from './Finance'
import refresh from '../../images/png/png_line_refresh.png';
import Input from '../common/Input';
import Button from '../common/Button';
import {useDispatch, useSelector} from 'react-redux'
import {cCodeList, searchComp, latestSearch, saveSearchLogAndGetDetail} from '../../modules/company'
import {RootState} from '../../modules'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {CompanyType} from '../../types/CompanyType';


const Company: React.FC<RouteComponentProps> = ({ history }:RouteComponentProps) => {
    const dispatch = useDispatch();
    const [isDisplay, setIsDisplay] = useState(false);
    let searchKeyword:string = "";

    const {codeListError, company, latestCompany, finances} = useSelector(({company}: RootState) => ({
        codeListError: company.codeListError,
        company: company.companies,
        latestCompany: company.latestCompany,
        finances: company.finances
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

        dispatch(cCodeList());
    }

    useEffect(() => {
        if (codeListError) {
            console.log("회사코드 최신화에 실패했습니다.");
        }
        else {
            console.log("회사코드가 최신화 되었습니다.");
        }

    },[codeListError])

    // 회사 검색 후 회사 리스트 화면으로 이동
    useEffect(() => {
        if (company) {
            console.log("company", company);

            history.push("/search");
        }
    },[company])

    // 최근 검색 회사 조회
    useEffect(() => {
        if (!latestCompany) {
            dispatch(latestSearch())
        }

        console.log(latestCompany);
    },[dispatch, latestCompany])

    // 회사 검색 이벤트
    const onSearchCo = (e: React.MouseEvent<HTMLButtonElement>) => {
       dispatch(searchComp(searchKeyword));
    }

    // search text change event
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>) => {
        searchKeyword = (e.target as HTMLInputElement).value;
    }

    // 회사검색 enter처리
    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            dispatch(searchComp(searchKeyword));
        }
    }

    // 검색기록 저장 및 세부내역 조회
    const onCLickForDetail = (index: number) => {
        const $ul = document.getElementById("warpCard") as HTMLUListElement;    // 회사 목록 영역

        if ($ul.children[index].classList.contains("selected")) {
            // 전체 보기
            $ul.children[index].classList.remove("selected")
            setIsDisplay(true)
        }
        else {
            // 세부 보기
            $ul.children[index].classList.add("selected")
        
            // 검색 기록 저장
            const {_id} = (latestCompany || [])[index]; 
            
            const params:CompanyType = {_id, searchType:"C"};
            setIsDisplay(false)
            //dispatch(saveSearchLogAndGetDetail(params))
        }        
    }

    useEffect(() =>{
        const $ul = document.getElementById("warpCard") as HTMLUListElement;    // 회사 목록 영역
        
        // console.log("is Show?", $ul.classList.contains("content_selected"));

        // console.log("finances", finances);

        // if ($ul.classList.contains("content_selected")) {
        //     // 상세보기 닫기
            
        // }
        // else {
        //     // 상세보기

        //     // 선택한 회사를 제외한 나머지 숨김
            
        //     //e.currentTarget.style.display = "block";
        // }

        displayCompany(isDisplay);
    }, [isDisplay]) 

    // 회사 목록 show/hide
    const displayCompany = (isDisplay: boolean) => {
        const $ul = document.getElementById("warpCard") as HTMLUListElement;    // 회사 목록 영역
        const detailArea = document.getElementById("contentDetail") as HTMLDivElement;  // 상세내용 영역
        const $lis = (document.getElementById("warpCard") as HTMLUListElement).children;

        for (let i = 0 ; i < $lis.length ; i++) {
            const $li = ($lis.item(i) as HTMLLIElement);

            console.log(isDisplay ? "block" : "none");
            console.log($li);

            $li.style.display = isDisplay ? "block" : "none";
        }

        if (isDisplay) {
            // 상세보기 닫기
            $ul.classList.remove("content_selected");
            detailArea.style.display = "none";
        }
        else {
            // 상세보기)

            $ul.classList.add("content_selected");
            detailArea.style.display = "contents";

            for (let i = 0 ; i < $lis.length ; i++) {
                const $li = ($lis.item(i) as HTMLLIElement);
    
                if ($li.classList.contains("selected")) {
                    $li.style.display = "block";
                }

                // $li.classList.remove("selected")
            }
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
                            {latestCompany && (latestCompany || []).map((com: any, index:number) => (
                                <Card 
                                    key={com._id}
                                    onClick={() => onCLickForDetail(index)}
                                    companyName={com.companyName} 
                                    companyCode={com.companyCode}
                                />
                            ))}
                        </ul>
                        <div id="contentDetail" className="content_detail"> <Finance/></div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default withRouter(Company);