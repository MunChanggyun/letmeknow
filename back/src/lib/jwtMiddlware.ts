/**
 * 토큰검증
 * router 이전에 호출되어야 한다.
 */

import jwt from 'jsonwebtoken'
import User from '../models/user'
import {Context} from 'koa'

const jwtMiddlware = async (ctx: Context, next: ()=> void) => {
    const token = ctx.cookies.get('access_token')

    if (!token) {
        return next();
    }

    try {
        //let env: string | undefined = process.env["JWT_SECRET"];

        const decoded = <any>jwt.verify(token, `${process.env.JWT_SECRET}`);

        ctx.state.user = {
            _id: decoded._id,
            username: decoded.username
        }

        // 토근의 남은 유효기간이 1일 미만이면 재발급
        const now = Math.floor(Date.now()/1000);

        if (decoded.exp - now < (60 * 60 * 24)) {
            const user = await User.findById(decoded._id)
            const token = user?.generateToken(); // Object is possibly 'null'. >> memo.txt 2번 참고

            ctx.cookies.set('access_token', token, {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7일동안 토큰보관
                httpOnly: true  // xss 공격을 막기위한 설정
            })
        }

        return next();
    }
    catch(e) {
        console.log(e);
        return next();
    }
}

export default jwtMiddlware