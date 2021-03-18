import React from 'react'
import { Link } from 'react-router-dom'
import '../../sass/common.scss'
import '../../sass/auth.scss'
import Button from '../common/Button'

const textMap: any = {
    login: '로그인',
    register: '회원가입'
}

type Props = {
    type: string,
    form: any,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
}

const AuthForm: React.FC<Props> = ({type, form, onChange, onSubmit}: Props) => {
    const tag:string  = textMap[type];

    return (
        <div className="AuthBlock">
            <h3>{tag}</h3>
            <form onSubmit={onSubmit}>
                <input className="Input" autoComplete="username" name="username" placeholder="아이디" onChange={onChange} value={form.username}/>
                <input type="password" className="Input" autoComplete="new-password" name="password" placeholder="비밀번호" onChange={onChange} value={form.password}/>
                {type === 'register' && (
                    <>
                        <input type="password" className="Input" autoComplete="new-password" name="passwordCheck" 
                            placeholder="비밀번호 확인" onChange={onChange} value={form.passwordCheck}/>
                        <input className="Input" autoComplete="email" name="email" placeholder="이메일" onChange={onChange} value={form.email}/>
                    </>
                )}
                <Button classes="Button fullWidth">{tag}</Button>
            </form>
            <div className="Footer">
                {type === 'register' ? (
                    <Link to="/login">로그인</Link>
                ) : (
                    <Link to="/register">회원가입</Link>
                )}
            </div>
        </div>
    );
}

export default AuthForm;