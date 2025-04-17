import {ApiResponse} from "@/apis/index";
import {getUserCookieAction} from "@/app/(auth)/actions";

/**
 * 封装客户端组件 Fetch
 *
 * @param url
 * @param options
 */
export async function clientFetcher(url: string, options: RequestInit = {}): Promise<ApiResponse> {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
    });

    if (res.status === 401) {
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }

    if (!res.ok) {
        console.log('Failed to clientFetcher.')
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
    console.log('get token :', token)

    const res = await fetch(url, {
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
        console.log('Failed to clientFetcher.')
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