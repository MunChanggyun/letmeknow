import React from 'react'
import AuthTemplate from '../components/auth/AuthTemplate'
import RegisterForm from '../components/auth/RegisterForm'


const RegisterPage: React.FC = () => {
    return (
        <AuthTemplate>
            <RegisterForm />
        </AuthTemplate>
    )
}

export default RegisterPage;

