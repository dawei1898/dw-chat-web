import React from 'react';
import ChatPage from "@/app/(chat)/chat/chat";
import {AgentMessage, ChatRecordVO, MessageVO} from "@/apis/chat-api";
import {Conversation} from "@ant-design/x/es/conversations";
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import {appConfig} from "@/utils/appConfig";
import type {ApiResponse, PageResult} from "@/apis";
import {getUserCookieAction} from "@/app/(auth)/actions";

const ChatHome = async () => {
    console.log('init ChatHome')
    let defaultConversationItems: Conversation[] = []
    let defaultActiveConversationKey: string = ''
    let defaultMessages: MessageInfo<AgentMessage>[] = []

    const userCookie = await getUserCookieAction();
    console.log('initConversations  userCookie:', userCookie)

    /**
     * 初始化会话记录
     */
    const initConversations = async () => {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            console.log('构建阶段，不执行 fetch')
            return null
        }
        const url = `${appConfig.apiBaseHostname}/api/chat`;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userCookie?.token}`,
            },
            body: JSON.stringify({
                pageNum: 1, pageSize: 90, chatName: ''
            }),
        }
        const resp: ApiResponse<PageResult<ChatRecordVO>> = await fetch(url, options)
            .then(resp => resp.json());

        if (resp.data) {
            defaultConversationItems = resp.data.list.map((item) => {
                return {
                    key: item.chatId,
                    label: item.chatName,
                }
            });
            if (defaultConversationItems.length > 0) {
                defaultActiveConversationKey = defaultConversationItems[0].key

                if (defaultActiveConversationKey) {
                   await queryMessageList(defaultActiveConversationKey)
                }
            }
        }
    }

    /**
     * 查询消息列表
     */
    const queryMessageList = async (conversationKey: string) => {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            console.log('构建阶段，不执行 fetch')
            return null
        }
        const url = `${appConfig.apiBaseHostname}/api/message?chatId=${conversationKey}`;
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userCookie?.token}`,
            }
        }
        const resp: ApiResponse<MessageVO[]> = await fetch(url, options)
            .then(resp => resp.json());

        // @ts-ignore
        defaultMessages = resp.data.map((item) => ({
            id: item.msgId,
            status: item.type === 'user' ? 'local' : 'success',
            message: {
                type: item.type,
                id: item.msgId,
                content: item.content,
                reasoningContent: item.reasoningContent,
                chatId: item.chatId,
                voteType: item.voteType,
            }
        }))
    }

    await initConversations();

    console.log('defaultConversationItems:', defaultConversationItems);
    console.log('defaultActiveConversationKey:', defaultActiveConversationKey);
    console.log('defaultMessages:', defaultMessages);

    return (
         <ChatPage
             defaultConversationItems={defaultConversationItems}
             defaultActiveConversationKey={defaultActiveConversationKey}
             defaultMessages={defaultMessages}
         />
    );
};

export default ChatHome;