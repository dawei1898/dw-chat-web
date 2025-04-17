import {NextRequest, NextResponse } from 'next/server'
import type {ApiResponse} from "@/apis";
import {LoginParam} from "@/apis/user-api";
import {appConfig} from "@/utils/appConfig";


/**
 * 用户登录 API
 */
export async function POST(request: NextRequest) {
    const body: LoginParam = await request.json();
    console.log('api/auth/login request body:', JSON.stringify(body))
    const { username, password}: LoginParam = body;

    //const url = `http://localhost:3000/dev/dwc/api/user/login`;
    const url = `${appConfig.clientHost}${appConfig.apiBaseUrl}/user/login`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password
        }),
    }
    const apiResponse: ApiResponse<string> = await fetch(url, options).then(resp => resp.json());
    console.log('api/auth/login response:', JSON.stringify(apiResponse));
    return NextResponse.json(apiResponse)
}
