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
    const url = `${appConfig.apiBaseHostname}${appConfig.apiBaseUrl}/chat/queryChatPage`;
    console.log('url:', url)
    // @ts-ignore
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authorization,
        },
        body: JSON.stringify(param),
    }
    const apiResponse: ApiResponse<PageResult<ChatRecordVO>> = await fetch(url, options)
        .then(resp => resp.json());
    console.log('api/chat response:', JSON.stringify(apiResponse));
    return NextResponse.json(apiResponse)
}
