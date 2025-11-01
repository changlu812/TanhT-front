import request from '@/utils/request.js'

/* 文章分类相关 */
export const articleCategoryListService = ()=>{
    return request.get("/category")
}

export const articleCategoryAddService = (data)=>{
    return request.post("/category", data)
}


export const articleCategoryUpdateService = (data)=>{
    return request.put("/category", data)
}

export const articleCategoryDeleteService = (id)=>{
    return request.delete('/category?id='+id)
}

/* 文章管理相关 */
//文章列表查询
export const articleListService = (params) => {
    return request.get('/article', { params: params })
}

//添加文章
export const articleAddService = (articleModel)=>{
    return request.post('/article',articleModel)
}

