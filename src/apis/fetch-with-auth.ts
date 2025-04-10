import {ApiResponse} from "@/apis/index";

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(url, {
        ...options,
        credentials: 'include', // 带上 cookie，重要！
    });

    if (res.status === 401) {
        window.location.href = '/login'; // 统一跳转到登录页
        return Promise.reject(new Error('Unauthorized')); // 显式拒绝，防止继续处理
    }

    if (!res.ok) {
        throw new Error('API error');
    }

    return res.json();
}

export default fetchWithAuth;
