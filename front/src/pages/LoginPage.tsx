import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import AuthTemplate from '../components/auth/AuthTemplate';


const LoginPage = () => {
    return (
        <>
            <AuthTemplate>
                <LoginForm/>
            </AuthTemplate>
        </>
    )
};

export default LoginPage;