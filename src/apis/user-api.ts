import {appConfig} from "@/utils/appConfig";
import type {ApiResponse} from "@/apis/index";
import {clientFetcher} from "@/apis/fetcher";


/**
 * 注册参数
 */
export interface RegisterParam {
    username?: string;
    email?: string;
    password: string;
}

/**
 * 登录参数
 */
export interface LoginParam {
    username: string;
    password: string;
}

/**
 * 已登录用户信息
 */
export interface LoginUser {
    username: string;
    token: string;
}

/**
 * 用户注册 API
 *
 * @param username
 * @param email
 * @param password
 */
export const  registerAPI = async ({username, email, password}: RegisterParam) => {
    const url = `${appConfig.apiBaseUrl}/user/register`;
    const options = {
        method: "POST",
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    //console.log('registerAPI response:', JSON.stringify(response));
    return response;
}

/**
 * 用户登录 API
 *
 * @param username
 * @param password
 */
export const loginAPI = async ({username, password}: LoginParam) => {
    const url = `${appConfig.apiBaseUrl}/user/login`;
    const options = {
        method: "POST",
        body: JSON.stringify({
            username,
            password
        }),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    //console.log('loginAPI response:', JSON.stringify(response));
    return response;
}


/**
 * 退出登录 API
 */
export const logoutAPI = async () => {
    const url = `${appConfig.apiBaseUrl}/user/logout`;
    const options = {
        method: "DELETE",
    }
    const response: ApiResponse<void> = await clientFetcher(url, options);
    return response;
}


/**
 * 查询用户信息 API
 */
export const queryUserAPI = async () => {
    const url = `${appConfig.apiBaseUrl}/user/queryUser`;
    const options = {
        method: "GET",
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    return response;
}