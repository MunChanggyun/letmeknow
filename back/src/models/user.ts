import mongoose, {Model, Schema, Document} from 'mongoose'
import {IUser} from './Interfaces/IUser' 
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new Schema<IUserDocument, UserModel>({
    username: String,
    hashedPassword: String,
    password: String,
    email: String
});

export interface IUserDocument extends IUser {
    hashedPassword: string,
    setPassword(password: string): Promise<number>,
    serialize(): object,
    checkPassword(password: string): boolean,
    generateToken(): string,
}

// 비밀번호 설정
UserSchema.methods.setPassword = async function (this:IUserDocument,  password: string) {
    const hash = await bcrypt.hash(password, 10)
    this.hashedPassword = hash
    this.password = password
    return 0;
}

// 비밀번호 검증
// 파라미터로 받은 비밀번호가 해당 계저의 빌밀번호와 일치하는지 검증
UserSchema.methods.checkPassword = async function(this:IUserDocument, password: string) {
    const result = await bcrypt.compare(password, this.hashedPassword);

    return result
}

// 리턴 데이터
UserSchema.methods.serialize = function(this:IUser) {
    const data = this.toJSON();

    return data;
}

// 토큰 발급
UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        // 첫번째 파라미터는 토큰안에 집어넣고 싶은 데이터를 넣는다.
        {
            _id: this.id,
            username: this.username
        },
        `${process.env.JWT_SECRET}`,    // JWT 암호
        {
            expiresIn: '3d' // 유효기간
        }
    )

    return token;
}

/**
 * 디비 작업이 필요한 함수들 정의
 */
export interface UserModel extends Model<IUserDocument> {
    findByUsername(u: string): Promise<IUserDocument>
  }

UserSchema.statics.findByUsername = async function(this:Model<IUserDocument>, username: string) {
    return this.findOne({ username });
} 

const User = mongoose.model<IUserDocument, UserModel>('User', UserSchema);

// 비밀번호 일치 여부 확인

export default User;