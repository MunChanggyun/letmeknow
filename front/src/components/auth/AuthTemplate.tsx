import React from 'react'
import '../../sass/auth.scss'
import { Link } from 'react-router-dom'

/**
 * 회원가입/ 로그인 페이지의 레이아웃을 담당하는 컴포넌트
 */

type Props = {
    children: JSX.Element | string
}

const AuthTemplate: React.FC<Props> = ({children}: Props ) =>(
    <div className="TemplateBlock">
        <div className="WhiteBox">
            <div className="logo-area">
                <Link to="/">REACTERS</Link>
            </div>
            {children}
        </div>
    </div>
)

export default AuthTemplate 