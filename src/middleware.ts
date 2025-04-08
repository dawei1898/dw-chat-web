import {NextRequest, NextResponse} from "next/server";
import {LoginUser} from "@/utils/user-api";
import {COOKIE_LOGIN_USER} from "@/utils/constant";


/**
 * 中间件, 运行在服务端
 * 拦截客户端过来的请求
 */
const middleware = (request: NextRequest) => {
    console.log('经过中间件了')
    console.log('url:', request.url);
    console.log('nextUrl:', request.nextUrl);

    const pathname = request.nextUrl.pathname;

    // 拦截 /dwc/api 请求，设置 token
    if (pathname.startsWith('/dwc/api/') && !pathname.startsWith('/dwc/api/user/login')) {
        let loginUserCookie = request.cookies.get(COOKIE_LOGIN_USER)
        console.log('loginUserCookie:', loginUserCookie)
        if (loginUserCookie) {
            const loginUser: LoginUser = JSON.parse(loginUserCookie?.value);
            // Clone the request headers and set a new header 'Authorization'
            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('Authorization', `Bearer ${loginUser.token}`)
            return  NextResponse.next({
                request: {
                    // New request headers
                    headers: requestHeaders,
                },
            })
        }
    }

}

export default middleware;


/**
 * 路径拦截配置
 */
export const config = {
    matcher: [
        '/dwc/api/:path*',
    ],
}