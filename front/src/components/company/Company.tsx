import React, { useEffect } from 'react'
import './../../sass/style.scss'
import cloud from '../../images/png/png_face_cloud.png';
import refresh from '../../images/png/png_line_refresh.png';
import Input from '../common/Input';
import Button from '../common/Button';
import {useDispatch, useSelector} from 'react-redux'
import {cCodeList, searchComp} from '../../modules/company'
import {RootState} from '../../modules'
import {CompanyType} from '../../types/CompanyType'


const Company: React.FC = () => {
    const dispath = useDispatch();
    let searchKeyword:string = "";

    const {codeListError} = useSelector(({company}: RootState) => ({
        codeListError: company.codeListError
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

    // 회사 검색 이벤트
    const onSearchCo = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log("searchKeyword", searchKeyword);
        dispath(searchComp(searchKeyword));
    }

    // search text change event
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>) => {
        searchKeyword = (e.target as HTMLInputElement).value;
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
                            <Input  type="text" placeHolder="키워드를 입력해주세요." onChange={onChangeKeyword}/>
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
                    <ul className="tab_content">
                        <li>
                            <div>
                                <p className="img">
                                    <img src={cloud} alt="" />
                                </p>
                                <p className="keyword">
                                    <span>기본</span>
                                    <span>즐겨찾기</span>
                                </p>
                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        </>
    )
};

export default Company