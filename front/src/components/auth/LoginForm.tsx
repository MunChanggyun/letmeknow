import React, { useEffect } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { changeField, initializeForm } from '../../modules/auth'
import {login} from '../../modules/auth'
import {check} from '../../modules/user'
import {RootState} from '../../modules'
import AuthForm from './AuthForm'

const LoginForm: React.FC = () => {
    const dispatch = useDispatch()
    const { form, user, auth, authError } = useSelector(({auth, user}: RootState) => ({
        form: auth.login,
        user: user.user,
        auth: auth.auth,
        authError: auth.authError
    }))

    useEffect(() => {
        dispatch(initializeForm('login'))
    },[dispatch])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target;

        dispatch(
            changeField({
                form: 'login',
                key: name,
                value
            })
        )
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { username, password } = form;

        dispatch(login({username, password}))
    }

    useEffect(() => {
        if (authError) {
            console.log(authError);
        }
        
        if (auth) {
            dispatch(check())
        }
    }, [auth, authError, dispatch])

    useEffect(() => {
        if (user) {
            console.log(user);
        }
        else {
            console.log("확인 실패");
        }
    },[user])

    return (
        <AuthForm type="login" form={form} onChange={onChange} onSubmit={onSubmit}/>
    )
}

export default LoginForm