import {ApiResponse} from "@/apis";
import {getUserCookieAction} from "@/app/(auth)/actions";
import {appConfig} from "@/utils/appConfig";
import Cookies from "js-cookie";
import {COOKIE_USER} from "@/utils/constant";
import {User} from "@/components/provider/auth-provider";

/**
 * 封装客户端组件 Fetch
 *
 * @param url
 * @param options
 */
export async function clientFetcher(url: string, options: RequestInit = {}): Promise<ApiResponse> {

    let token: string = '' ;
    const userCookie = Cookies.get(COOKIE_USER);
    if (userCookie) {
        try {
            const user: User = JSON.parse(userCookie);
            token = user.token
        } catch (e) {
            console.error('Failed to parse user cookie.', e)
        }
    }
    console.log('client get token :', token)

    const res = await fetch(`${appConfig.apiBaseUrl}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        },
    });

    if (res.status === 401) {
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }

    if (!res.ok) {
        console.error('Failed to clientFetcher.')
        throw new Error('API error');
    }

    const apiResponse: ApiResponse = await res.json();
    if (apiResponse.code === 401) {
        console.log('鉴权失败 401')
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }
    return apiResponse;
}


/**
 * 封装服务端组件 Fetch
 *
 * 用于在 服务组件 fetch api/route
 *
 * @param url
 * @param options
 */
export async function serverFetcher(url: string, options: RequestInit = {}): Promise<ApiResponse> {

    const userCookie = await getUserCookieAction();
    const token = userCookie?.token || '';
    console.log('server get token :', token)
    if (!token) {
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }

    const res = await fetch(`${appConfig.clientHost}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        },
    });

    if (res.status === 401) {
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }

    if (!res.ok) {
        console.error('Failed to clientFetcher.')
        throw new Error('API error');
    }

    const apiResponse: ApiResponse = await res.json();
    if (apiResponse.code === 401) {
        console.log('鉴权失败 401')
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }
    return apiResponse;
}