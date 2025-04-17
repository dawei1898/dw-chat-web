import {NextRequest, NextResponse} from "next/server";
import {appConfig} from "@/utils/appConfig";
import type {ApiResponse, PageResult} from "@/apis";
import {ChatRecordVO, RecordPageParam} from "@/apis/chat-api";



/**
 * 查询会话列表 API
 */
export async function POST(request: NextRequest) {
    const body: RecordPageParam = await request.json();
    console.log('POST api/chat request body:', JSON.stringify(body))
    const param: RecordPageParam = body;

    const authorization = request.headers.get('Authorization') || '';
    console.log('authorization', authorization)

    //const url = `http://localhost:3000/dev/dwc/api/chat/queryChatPage`;
    const url = `${appConfig.clientHost}${appConfig.apiBaseUrl}/chat/queryChatPage`;
    console.log('url:', url)
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authorization,
        },
        body: JSON.stringify(param),
        //cache: 'no-store', // 禁止缓存
    }
    const resp = await fetch(url, options);
    if (!resp.ok) {
        console.log('Failed to queryChatPage.', resp.status)
    }
    const apiResponse: ApiResponse<PageResult<ChatRecordVO>> = await resp.json();
    console.log('api/chat response:', JSON.stringify(apiResponse));
    return NextResponse.json(apiResponse)
}
