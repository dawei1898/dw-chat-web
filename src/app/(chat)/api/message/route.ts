import {NextRequest, NextResponse} from "next/server";
import {appConfig} from "@/utils/appConfig";
import type {ApiResponse } from "@/apis";
import {  MessageVO } from "@/apis/chat-api";



/**
 * 查询当前会话消息列表 API
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId') || '';
    console.log('chatId:', chatId)
    const authorization = request.headers.get('Authorization') || '';
    console.log('authorization', authorization)

    //const url = `http://localhost:3000/dev/dwc/api/chat/queryMessageList/dfaeafd12ead3d`;
    const url = `${appConfig.apiBaseHostname}${appConfig.apiBaseUrl}/chat/queryMessageList/${chatId}`;
    console.log('url:', url)
    // @ts-ignore
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authorization,
        }
    }
    const apiResponse: ApiResponse<MessageVO[]> = await fetch(url, options)
        .then(resp => resp.json());
    console.log('api/message response:', JSON.stringify(apiResponse));
    return NextResponse.json(apiResponse)
}
