import React, { ChangeEvent, FormEvent, useEffect } from 'react'
import AuthForm from './AuthForm';
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '../../modules'
import {changeField, initializeForm, register} from '../../modules/auth'
import {withRouter, RouteComponentProps } from 'react-router-dom'

interface Props extends RouteComponentProps {}

const RegisterForm: React.FC<Props> = ({history}: Props) => {
    const dispatch = useDispatch();
    const { form, auth, authError} = useSelector(({auth}: RootState) => ({
        form: auth.register,
        auth: auth.auth,
        authError: auth.authError
    }))

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target

        dispatch(
            changeField({
                form: "register",
                key: name,
                value
            })
        )
    }

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const {username, password, passwordCheck, email} = form;

        if (password !== passwordCheck) {
            return;
        }

        dispatch(
            register({
                username, password, email
            })
        )
    }

    // form 초기화
    useEffect(() => {
        dispatch(initializeForm('register'))
    }, [dispatch])

    // 회원가입 실패/성공
    useEffect(() => {
        if (authError) {
            console.log("오류발생");
            return
        }
        
        if (auth) {
            history.push("/login");
        }
    }, [auth, authError])

    return (
        <AuthForm type="register" form={form} onChange={onChange} onSubmit={onSubmit}></AuthForm>
    )
}

export default withRouter(RegisterForm)