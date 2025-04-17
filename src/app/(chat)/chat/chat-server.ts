import {Conversation} from "@ant-design/x/es/conversations";
import {ApiResponse, PageResult} from "@/apis";
import {ChatRecordVO} from "@/apis/chat-api";
import {appConfig} from "@/utils/appConfig";
import {getUserCookieAction} from "@/app/(auth)/actions";


/**
 * 查询初始会话列表
 */
export const fetchInitChatList = async (): Promise<Conversation[]> => {
    console.log('fetchInitChatList')
    try {
        const userCookie = await getUserCookieAction();
        console.log('initConversations  userCookie:', userCookie)
        if (!userCookie) {
            console.log('[chatService] 无 token，跳过会话请求');
            return [];
        }

        const url = `${appConfig.clientHost}/api/chat`;
        console.log('url:', url)
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userCookie?.token}`,
            },
            body: JSON.stringify({
                pageNum: 1, pageSize: 90, chatName: ''
            }),
            //cache: 'no-store', // 禁止缓存
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            console.log('Failed to /api/chat:', JSON.stringify(response))
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resp: ApiResponse<PageResult<ChatRecordVO>> = await response.json();

        if (resp.data) {
            return resp.data.list.map((item) => {
                return {
                    key: item.chatId,
                    label: item.chatName,
                }
            });
        }
    } catch (e) {
        console.log('Failed to initConversations.', e)
    }
    return []
};