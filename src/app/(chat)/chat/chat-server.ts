import {Conversation} from "@ant-design/x/es/conversations";
import {ApiResponse, PageResult} from "@/apis";
import {ChatRecordVO} from "@/apis/chat-api";
import {appConfig} from "@/utils/appConfig";
import {serverFetcher} from "@/apis/fetcher";


/**
 * 查询初始会话列表
 */
export const fetchInitChatList = async (): Promise<Conversation[]> => {
    console.log('fetchInitChatList')
    try {
        const url = `${appConfig.clientHost}/api/chat`;
        console.log('url:', url)
        const options = {
            method: "POST",
            body: JSON.stringify({
                pageNum: 1, pageSize: 90, chatName: ''
            }),
        }
        const resp: ApiResponse<PageResult<ChatRecordVO>> = await serverFetcher(url, options);

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