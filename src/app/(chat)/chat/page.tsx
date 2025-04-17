export const dynamic = 'force-dynamic'; // 声明为动态渲染, 防止构建时渲染为静态文件

import React from 'react';
import ChatPage from "@/app/(chat)/chat/chat";
import {fetchInitChatList} from "@/app/(chat)/chat/chat-server";

const ChatHome = async () => {
    console.log('init ChatHome')

    const defaultConversationItems = await fetchInitChatList();
    console.log('defaultConversationItems:', defaultConversationItems);

    return (
         <ChatPage
             defaultConversationItems={defaultConversationItems}
         />
    );
};

export default ChatHome;