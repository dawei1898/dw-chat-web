import {appConfig} from "@/utils/appConfig";
import type {ApiResponse, PageParam, PageResult} from "@/apis/index";
import {clientFetcher} from "@/apis/fetcher";


/**
 * 会话记录
 */
export interface ChatRecord {
    chatId: string;
    chatName: string;
}

/**
 * 会话记录返参
 */
export interface ChatRecordVO extends ChatRecord {
    createTime: string;
}

/**
 * 分查询会话记录入参
 */
export interface RecordPageParam extends PageParam {
    chatName: string
}

/**
 * 流式对话入参
 */
export interface StreamChatParam {
    chatId: string;
    content: string;
    modelId?: string;
    openReasoning?: boolean;
    openSearch?: boolean;
}

/**
 * 对话消息返参
 */
export interface MessageVO {
    msgId: string;
    chatId: string;
    type: string;
    content: string;
    reasoningContent?: string;
    voteType?: string;
    modelId?: string;
}

export type UserAgentMessage = {
    type: 'user';
    id: string;
    content: string;
    reasoningContent?: string;
    chatId?: string;
    openReasoning?: boolean;
    openSearch?: boolean;
};

export type AIAgentMessage = {
    type: 'ai';
    id: string;
    content: string;
    reasoningContent?: string;
    chatId?: string;
    voteType?: 'up' | 'down' | '';
    loading?: boolean;
    openReasoning?: boolean;
    openSearch?: boolean;
};

export type AgentMessage = UserAgentMessage | AIAgentMessage;

export type BubbleMessage = {
    role: string;
};


/**
 * 点赞评论入参
 */
export interface VoteParam {
    contentId: string;
    voteType: string;
}




/**
 * 查询会话列表 API
 *
 * @param param
 */
export const  queryChatPageAPI = async (param: RecordPageParam) => {
    const url = `${appConfig.apiBaseUrl}/chat/queryChatPage`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<PageResult<ChatRecordVO>> = await clientFetcher(url, options);
    return response;
}


/**
 * 保存会话 API
 */
export const  saveChatAPI = async (param: ChatRecord) => {
    const url = `${appConfig.apiBaseUrl}/chat/saveChat`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    return response;
}


/**
 * 删除会话 API
 */
export const  deleteChatAPI = async (chatId: string) => {
    const url = `${appConfig.apiBaseUrl}/chat/deleteChat/${chatId}`;
    const options = {
        method: "DELETE",
    }
    const response: ApiResponse<number> = await clientFetcher(url, options);
    return response;
}




/**
 * 查询当前会话消息列表
 */
export const  queryMessageListAPI = async (chatId: string) => {
    const url = `${appConfig.apiBaseUrl}/chat/queryMessageList/${chatId}`;
    const options = {
        method: "GET",
    }
    const response: ApiResponse<MessageVO[]> = await clientFetcher(url, options);
    return response;
}


/**
 * 点赞/踩 API
 */
export const  saveVoteAPI = async (param: VoteParam) => {
    const url = `${appConfig.apiBaseUrl}/vote/saveVote`;
    const options = {
        method: "POST",
        body: JSON.stringify(param),
    }
    const response: ApiResponse<string> = await clientFetcher(url, options);
    return response;
}


