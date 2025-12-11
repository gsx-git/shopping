import { ElMessage } from 'element-plus'
import router from '../router'
import axios from "axios";

const request = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 30000,  // 后台接口超时时间设置
    withCredentials: true, // 启用跨域请求携带 cookie
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    // console.log('拦截器通过', config)
    return config
}, error => {
    // console.error('请求拦截器错误', err)
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            return res
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        // 当权限验证不通过的时候给出提示
        if (res.code === '401') {
            ElMessage.error(res.msg);
            router.push("/login")
        }
        // console.log('响应拦截器通过', res)
        return res;
    },
        error => {
        console.log('err' + error)
        if (error.response) {
            if (error.response.status === 401) {
                ElMessage.error('登录已过期，请重新登录');
                router.push("/login");
            } else if (error.response.status === 403) {
                ElMessage.error('没有权限访问');
            } else {
                ElMessage.error(error.response.data?.msg || '请求失败');
            }
        }
        // console.error('响应拦截器错误', err)
        return Promise.reject(error)
    }
)


export default request
