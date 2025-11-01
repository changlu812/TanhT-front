import request from '@/utils/request.js'

/* 用户注册 */
export const userRegisterService=(RegisterData)=> {
    const params = new URLSearchParams();
    for(let key in RegisterData) {
        params.append(key, RegisterData[key]);
    }
    return request.post('/user/register', params);
}

/*用户登录 */
export const userLoginService=(LoginData)=> {
    const params = new URLSearchParams();
    for(let key in LoginData) {
        params.append(key, LoginData[key]);
    }
    return request.post('/user/login', params);
}

//获取个人信息
export const userInfoGetService = ()=>{
    return request.get('/user/userInfo');
}

/* 修改用户信息 */
export const userInfoUpdateService = (userInfo)=>{
    return request.put('/user/update', userInfo);
}

/* 修改用户头像 */
//修改头像
export const userAvatarUpdateService=(avatarUrl)=>{
    let params = new URLSearchParams();
    params.append('avatarUrl',avatarUrl)
    return request.patch('/user/updateAvatar',params)
}

/* 修改密码 */
export const userPasswordUpdateService=(params)=>{
    return request.patch('/user/updatePwd',params)
}