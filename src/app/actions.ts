'use server';

import {cookies} from 'next/headers';
import {LoginUser} from "@/apis/user-api";
import {COOKIE_LOGIN_USER} from "@/utils/constant";

/**
 * 服务端组件
 */

/**
 * 储存登录用户信息到 cookie
 *
 * @param username
 * @param token
 */
export async function setLoginUserCookie(username: string, token: string) {
    const cookie = await cookies();
    cookie.set(COOKIE_LOGIN_USER,
        JSON.stringify({username, token}),
        {
            path: '/',
            maxAge: 60 * 60 * 24 * 3, // 3 天
        }
    );
}

/**
 * 清除 cookie 中的登录用户信息
 */
export async function  cleanLoginUserCookie() {
    const cookie = await cookies();
    cookie.delete(COOKIE_LOGIN_USER)
}

/**
 * 从 cookie 获取登录用户信息
 */
export async function getLoginUserCookie() {
    const cookie = await cookies();
    const loginUserCookie = cookie.get(COOKIE_LOGIN_USER);
    if (loginUserCookie) {
        const loginUser: LoginUser = JSON.parse(loginUserCookie.value);
        return loginUser
    }
}