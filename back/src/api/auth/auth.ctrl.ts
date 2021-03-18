import {IUser} from '../../models/Interfaces/IUser'
import {Context} from 'koa'
import Joi from 'joi'
import User, {IUserDocument} from '../../models/user';

// 회원가입
export const register = async (ctx: Context) => {
    /**
     * 아이디, 비밀번호, 이메일 필수값 설정
     */
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().required()
    });

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return
    }

	const {username, password, email} = ctx.request.body;

    try {
        const checkUser: IUserDocument = await User.findByUsername(username)

        if (checkUser) {
            ctx.status = 401;
            ctx.body = '이미 가입된 아이디 입니다.'
            return
        }

        const user = new User({username, email})

        await user.setPassword(password)
        await user.save(); 

        ctx.body = user.serialize();

        const token = user.generateToken();

        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 3,
            httpOnly:true
        })
    }
    catch (e) {
        ctx.throw(500,e)
    }
}

// 로그인
export const login = async (ctx: Context) => {
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
    });

    const result = schema.validate(ctx.request.body);

    const {username, password} = ctx.request.body;

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return
    }

    try {
        const user: IUserDocument = await User.findByUsername(username);
        
        if (!user) {
            ctx.status = 400;
            ctx.body = "존재하지 않는 아이디 입니다.";
            return;
        }

        const checkPW = await user.checkPassword(password);        

        if (!checkPW) {
            ctx.status = 400;
            ctx.body = "비밀번호가 일치하지 않습니다.";
            return;
        }

        ctx.body = user.serialize();

        console.log(ctx.body);

        const token = user.generateToken();

        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 3,
            httpOnly:true
        })
    }
    catch (e) {
        console.log(e.message);
        ctx.status = 500;
        ctx.body = e.message
    } 
}

// 로그인 상태 확인
export const check = async (ctx: Context) => {
    const { user } = ctx.state;

    console.log(ctx.state, user);

    if (!user) {
        // 로그인중이 아님
        ctx.status = 401;
        ctx.body = "로그인 상태가 아닙니다.";
        return;
    }
    
    ctx.body = user;
}

// 로그아웃
export const logout = async (ctx: Context) => {
    ctx.cookies.set('access_token')
    ctx.status = 204
}