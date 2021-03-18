import client from '../client'
import {IUser} from './types/IUser'

// 로그인
export const login  = ({username, password}: IUser) => 
    client.post('/api/auth/login', { username, password})

// 회원가입
export const register = ({username, password, email}: IUser) =>
    client.post('/api/auth/register', {username, password, email})

// 로그인 상태확인
export const check = () => client.get('/api/auth/check')