import axios from 'axios'

const client = axios.create();

axios.interceptors.response.use(
    response => {
        // 요청성공시 특정 작업 수행
        console.log("intercepter success");

        return response
    }
    , (error: Error) => {
        // 요청실패시 특정작업 실행
        console.log("intercepter fail");

        return Promise.reject(error)
    }
)

export default client