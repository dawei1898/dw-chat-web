"use client"

import React, {useEffect, useRef, useState} from 'react';
import {useImmer} from 'use-immer';
import dynamic from 'next/dynamic';
import {
    Bubble,
    Conversations,
    ConversationsProps,
    Sender,
    useXAgent,
    useXChat,
    XProvider, XRequest
} from "@ant-design/x";
import {
    Button, GetProp, Space,
    message as apiMessage,
    Tooltip, theme,
    ThemeConfig, Flex,
    Modal, Input, Typography, type AvatarProps
} from "antd";
import {
    CopyOutlined, DeleteOutlined, DislikeFilled,
    DislikeOutlined, DownOutlined, EditOutlined,
    GlobalOutlined, LikeFilled, LikeOutlined,
    NodeIndexOutlined, PaperClipOutlined,
    PlusOutlined, UpOutlined, UserOutlined
} from "@ant-design/icons";
import '@ant-design/v5-patch-for-react-19'; // 兼容 React19
import {BubbleDataType} from "@ant-design/x/es/bubble/BubbleList";
import MarkdownRender from "@/app/(chat)/chat/markdown-render";
import InitWelcome from "@/app/(chat)/chat/init-welcome";
import Logo from "@/app/(chat)/chat/logo";
import zhCN from "antd/locale/zh_CN";
import Footer from "@/app/(chat)/chat/footer";
import HeaderActions from "@/app/(chat)/chat/header-actions";
import type {ProTokenType} from "@ant-design/pro-provider";
import {SiderMenuProps} from "@ant-design/pro-layout/es/components/SiderMenu/SiderMenu";
import type {HeaderViewProps} from "@ant-design/pro-layout/es/components/Header";
import {DeepSeekIcon, PanelLeftClose, PanelLeftOpen} from "@/components/Icons";
import {Conversation} from "@ant-design/x/es/conversations";
import {writeText} from "clipboard-polyfill";
import {appConfig} from "@/utils/appConfig";
import {ProLayout} from "@ant-design/pro-layout";
import {
    AgentMessage,
    AIAgentMessage,
    deleteChatAPI,
    MessageVO,
    queryChatPageAPI,
    queryMessageListAPI,
    saveChatAPI,
    saveVoteAPI,
    StreamChatParam
} from "@/apis/chat-api";
import {getUserCookieAction} from "@/app/(auth)/actions";
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import {useTheme} from "@/components/provider/theme-provider";
import {useAuth} from "@/components/provider/auth-provider";
import AvatarDropdown from "@/app/(chat)/chat/avatar-dropdown";
import {ProLayoutProps} from "@ant-design/pro-components";


// 动态导入
/*const ProLayout = dynamic(
    () => import('@ant-design/pro-components').then(mod => mod.ProLayout),
    { ssr: false }
);*/

const defaultConversationsItems: GetProp<ConversationsProps, 'items'> = []


type ChatProps = {
    defaultConversationItems?: Conversation[];
}

const ChatPage = (props: ChatProps) => {
    console.log('init ChatPage')
    const {token} = theme.useToken();
    const {isDark} = useTheme();
    const {user} = useAuth();
    const [inputTxt, setInputTxt] = useState<string>('');
    const [requestLoading, setRequestLoading] = useState<boolean>(false);
    const [conversationsItems, setConversationsItems] = useState(props.defaultConversationItems);
    const [activeConversationKey, setActiveConversationKey] = useState<string>('');
    const [openSearch, setOpenSearch] = useState<boolean>(false);
    const [openReasoning, setOpenReasoning] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [messageItems, updateMessageItems] = useImmer<BubbleDataType[]>([])
    const [collapsed, setCollapsed] = useState(false);


    // 主题配置
    const customTheme: ThemeConfig = {
        algorithm: isDark() ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: token.colorPrimary,
        }
    }

    // ProLayout Token
    const proLayoutToken: ProTokenType['layout'] = {
        pageContainer: {
            colorBgPageContainer: isDark() ? '' : token.colorBgBase,
            paddingBlockPageContainerContent: 10,  // 上下内距离
            paddingInlinePageContainerContent: 5, // 左右内距离
        },
        sider: {
            paddingInlineLayoutMenu: 2,
        }
    }

    /* 侧边栏触发器 */
    const SidebarTrigger = (
        <Tooltip
            title={collapsed ? '打开边栏' : '收起边栏'}
            placement='right'
        >
            <Button
                styles={{icon: {color: '#676767'}}}
                type='text'
                icon={collapsed ? <PanelLeftOpen/> : <PanelLeftClose/>}
                onClick={() => setCollapsed(!collapsed)}
            />
        </Tooltip>
    )

    // 处理 logo 和标题文字的样式
    const menuHeaderRender = (logo: React.ReactNode, title: React.ReactNode, props?: SiderMenuProps) => {
        return (
            <Flex align='center'>
                {logo}
                {<span
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    {title}
                </span>}
            </Flex>
        )
    }

    // 开启新对话按钮
    const addConversationRender = (props: SiderMenuProps) => {
        return <>
            {props.collapsed ?
                <Tooltip title='开启新对话'>
                    <Button
                        style={{
                            backgroundColor: '#1677ff0f',
                            border: '1px solid #1677ff34',
                            width: ' 35px',
                            margin: '10px -7px',
                        }}
                        type='link'
                        icon={<PlusOutlined/>}
                        onClick={clickAddConversation}
                    />
                </Tooltip>
                :
                <Button
                    style={{
                        backgroundColor: '#1677ff0f',
                        border: '1px solid #1677ff34',
                        borderRadius: '10px',
                        width: 'calc(100% - 25px)',
                        height: '35px',
                        margin: '12px',
                    }}
                    type={'link'}
                    icon={<PlusOutlined/>}
                    onClick={clickAddConversation}
                >
                    开启新对话
                </Button>
            }
        </>
    }

    // 点击添加会话
    const clickAddConversation = () => {
        setActiveConversationKey('')
        setMessages([])
    }

    // 添加会话
    const addConversation = async (msg: string) => {
        if (msg) {
            let chatId: string = ''
            const chatName = msg.length > 10 ? msg.substring(0, 10) : msg
            const resp = await saveChatAPI({chatId, chatName})
            if (resp.code === 200) {
                // 初始化会话记录列表
                await initConversations()
                return resp.data;
            }
        }
    };


    /**
     * 初始化会话记录
     */
    const initConversations = async () => {
        const resp = await queryChatPageAPI({
            pageNum: 1, pageSize: 100, chatName: ''
        })
        if (resp.data) {
            const initConversationItems: Conversation[] = resp.data.list.map((item) => {
                return {
                    key: item.chatId,
                    label: item.chatName,
                }
            });
            setConversationsItems(initConversationItems)

            if (initConversationItems.length > 0) {
                handleSelectedConversation(initConversationItems[0].key)
            }
        }
    }

    /**
     * 选中会话项
     */
    const handleSelectedConversation = (conversationKey: string) => {
        setActiveConversationKey(conversationKey)
    }

    /**
     * 保存会话名称
     */
    const saveConversation = async (key: string, label: string) => {
        const resp = await saveChatAPI({
            chatId: key,
            chatName: label,
        })
        if (resp.code == 200) {
            await initConversations()
        } else {
            apiMessage.error(resp.message)
        }
    }

    /**
     * 删除会话记录
     */
    const deleteConversation = async (conversationKey: string) => {
        if (conversationKey) {
            const resp = await deleteChatAPI(conversationKey)
            if (resp.code == 200) {
                await initConversations()
            } else {
                apiMessage.error(resp.message)
            }
        }
    }

    /*useEffect(() => {
        initConversations().then()
    }, []);*/


    // 会话编辑
    const menuConfig: ConversationsProps['menu'] = (conversation) => ({
        items: [
            {
                label: '重命名',
                key: 'rename',
                icon: <EditOutlined/>,
            },
            {
                label: '删除',
                key: 'delete',
                icon: <DeleteOutlined/>,
                danger: true,
            },
        ],
        onClick: (menuInfo) => {
            menuInfo.domEvent.stopPropagation();
            let newLabel = '';
            // 重命名会话
            if (menuInfo.key === 'rename') {
                Modal.confirm({
                    title: '重命名会话',
                    content: (
                        <Input
                            placeholder="请输入新的会话名称"
                            defaultValue={conversation.label?.toString()}
                            onChange={(e) => {
                                newLabel = e.target.value;
                            }}
                        />
                    ),
                    onOk: async () => {
                        if (newLabel) {
                            await saveConversation(conversation.key, newLabel)
                            apiMessage.success('重命名成功');
                        }
                    },
                    onCancel: () => {
                        apiMessage.info('取消重命名');
                    },
                });
            }
            // 删除会话
            if (menuInfo.key === 'delete') {
                Modal.confirm({
                    title: '永久删除对话',
                    content: '删除后，该对话不可恢复，确认删除吗？',
                    okType: 'danger',
                    okText: '删除',
                    onOk: async () => {
                        await deleteConversation(conversation.key)
                        apiMessage.success('删除成功')
                    }
                });
            }
        },
    });

    // 会话管理列表
    const conversationRender = (props: SiderMenuProps, defaultDom: React.ReactNode) => {
        return <>
            {!props.collapsed &&
                <div className='h-full px-1 overflow-y-auto scrollbar-container'>
                    <Conversations
                        items={conversationsItems}
                        menu={menuConfig}
                        activeKey={activeConversationKey}
                        onActiveChange={setActiveConversationKey}
                    />
                </div>

            }
        </>
    }

    // actionsRender
    const actionsRender = (props: HeaderViewProps) => {
        return <HeaderActions headerProps={props}/>
    }

    /**
     * 用户头像渲染
     */
    const avatarRender: ProLayoutProps['avatarProps'] = {
        icon: (<UserOutlined/>),
        size: 'small',
        title: (<>{user?.username}</>),
        render: (avatarProps: AvatarProps, avatarChildren: React.ReactNode) => {
            return (<AvatarDropdown>{avatarChildren}</AvatarDropdown>);
        },
    }

    // 模型连接信息
    const xRequest = XRequest({
        //baseURL:  http://localhost:9500/chat/streamChat,
        baseURL:  `${appConfig.apiStreamChatUrl}`,
        fetch: async (url, options) => {
            return  fetch(url, {
                ...options,
                headers: {
                    "Authorization": `Bearer ${(await getUserCookieAction())?.token}`,
                    ...options?.headers,
                },
                signal: abortControllerRef.current?.signal, // 控制停止
            })
        }
    });

    /**
     * 与大模型交互
     */
    const [agent] = useXAgent<AgentMessage>({
        request: async (info, callbacks) => {
            const {message, messages} = info
            const {onUpdate: onAgentUpdate, onSuccess: onAgentSuccess, onError: onAgentError} = callbacks;
            //console.log('message', message)
            console.log('message list:', JSON.stringify(messages))

            const aiMessage: AIAgentMessage = {
                type: 'ai',
                loading: true,
                chatId: '',
                id: '',
                content: '',
                reasoningContent: '',
            }
            await xRequest.create<StreamChatParam, MessageVO>(
                {
                    chatId: message?.chatId || '',
                    content: message?.content || '',
                    openReasoning: message?.openReasoning,
                    openSearch: message?.openSearch,
                },
                {
                    onUpdate: (chunk) => {
                        try {
                            setRequestLoading(false);
                            //console.log('onUpdate', JSON.stringify(chunk));
                            // @ts-ignore
                            const data: MessageVO = JSON.parse(chunk.data);

                            aiMessage.id = data.msgId
                            aiMessage.chatId = data.chatId

                            const reasoning_content: string = data.reasoningContent || ''
                            const resp_content: any = data.content || ''
                            // 思考中
                            if (reasoning_content) {
                                aiMessage.reasoningContent += reasoning_content;
                            }
                            // 回答
                            if (resp_content) {
                                aiMessage.content += resp_content;
                            }
                            //console.log('onAgentUpdate， aiMessage：', JSON.stringify(aiMessage));
                            onAgentUpdate(aiMessage);
                        } catch (e) {
                            console.log('onUpdate fail：', e);
                        }
                    },
                    onSuccess: (chunk) => {
                        //console.log('onSuccess， chunk：', JSON.stringify(chunk));
                        //console.log('onSuccess， aiMessage：', JSON.stringify(aiMessage));
                        onAgentSuccess(aiMessage);
                    },
                    onError: (error) => {
                        console.log('onError', error);
                        onAgentError(error);
                        setRequestLoading(false);
                    },
                },
            )
        }
    })

    const {onRequest, messages, setMessages} = useXChat({
        agent: agent,
        requestPlaceholder: {
            id: '1',
            type: 'ai',
            content: '请求中...',
        },
        /*defaultMessages: [
            {
                id: 'init',
                status: 'success',
                message: {
                    type: 'ai',
                    id: '11',
                    content: 'Hello, what can I do for you?',
                },
            },
        ],*/
    });


    /**
     * 思考过程
     */
    const MessageHeader = ({message}: { message: AIAgentMessage }) => {
        const [open, setOpen] = useState<boolean>(true)

        return (message.reasoningContent &&
            <Flex vertical>
                <Button
                    style={{
                        width: '130px',
                        marginBottom: '5px',
                        borderRadius: token.borderRadiusLG,
                    }}
                    color="default"
                    variant="filled"
                    onClick={() => setOpen(!open)}
                >
                    <NodeIndexOutlined/>
                    {'深度思考'}
                    {open ? <UpOutlined style={{fontSize: '10px'}}/>
                        : <DownOutlined style={{fontSize: '10px'}}/>}
                </Button>
                {open &&
                    <div className='max-w-[600px] border-l-2 my-2 mr-2 pl-4'>
                        <Typography.Text type='secondary'>
                            {message.reasoningContent}
                        </Typography.Text>

                        {/*<Bubble
                            content={message.reasoningContent}
                            variant='borderless'
                            typing={message.loading && {step: 5, interval: 50}}
                            style={{maxWidth: 600}}
                            messageRender={(content) =>
                                <Typography.Text type='secondary'>
                                    {content}
                                </Typography.Text>
                            }
                        />*/}
                    </div>
                }

            </Flex>
        )
    }

    /**
     * 消息点赞
     */
    const msgLike = async (message: AIAgentMessage) => {
        message.voteType = message.voteType === 'up' ? '' : 'up'
        await saveVoteAPI({'contentId': message.id, 'voteType': message.voteType})
        if (message.voteType === 'up') {
            apiMessage.success('感谢您的支持')
        }
    }

    /**
     * 消息点踩
     */
    const msgDislike = async (message: AIAgentMessage) => {
        message.voteType = message.voteType === 'down' ? '' : 'down'
        await saveVoteAPI({'contentId': message.id, 'voteType': message.voteType})
        if (message.voteType === 'down') {
            apiMessage.info('感谢您的反馈')
        }
    }

    const MessageFooter = ({message}: { message: AIAgentMessage }) => {
        return <Space>
            <Tooltip title='喜欢'>
                <Button
                    size={'small'} type={'text'} icon={message.voteType === 'up' ? <LikeFilled/> : <LikeOutlined/>}
                    onClick={() => msgLike(message)}
                />
            </Tooltip>
            <Tooltip title='不喜欢'>
                <Button
                    size={'small'} type={'text'}
                    icon={message.voteType === 'down' ? <DislikeFilled/> : <DislikeOutlined/>}
                    onClick={() => msgDislike(message)}
                />
            </Tooltip>
            <Tooltip title='复制'>
                <Button
                    size={'small'} type={'text'} icon={<CopyOutlined/>}
                    onClick={() => {
                        writeText(message.content);
                        apiMessage.success('已复制');
                    }}
                />
            </Tooltip>
        </Space>
    }


    /*useEffect(() => {
        if (props.defaultMessages) {
            console.log('init Messages')
            setMessages(props.defaultMessages)
        }
    }, []);*/

    useEffect(() => {
        const finalMessageItems: BubbleDataType[] = messages.length > 0
            ? messages.map((
                {id, message, status}) =>
                ({
                    key: message.id,
                    role: message.type,
                    header: (message.type === 'ai' && <MessageHeader message={message as AIAgentMessage}/>),
                    content: message.content,
                    footer: ((!agent.isRequesting() && message.type === 'ai') &&
                        <MessageFooter message={message as AIAgentMessage}/>
                    ),
                    loading: status === 'loading' && requestLoading,
                    placement: message.type === 'ai' ? 'start' : 'end',
                    variant: message.type === 'ai' ? (message.content ? 'outlined' : 'borderless') : undefined,
                    avatar: message.type === 'ai' ?
                        {
                            icon: <DeepSeekIcon/>,
                            style: {border: '1px solid #c5eaee', backgroundColor: 'white'}
                        } : undefined,
                    typing: message.type === 'ai' && message.loading ?
                        {step: 5, interval: 50} : undefined,
                    style: message.type === 'ai' ? {maxWidth: 700} : undefined,
                    messageRender: message.type === 'ai' ?
                        ((content) => (<MarkdownRender content={content}/>)) : undefined,
                }))
            : [{ content: (<InitWelcome handleSubmit={handleSubmitMsg}/>),
                variant: 'borderless' }];
        updateMessageItems(finalMessageItems);
    }, [messages]);


    /**
     * 查询消息列表
     */
    const queryMessageList = async (conversationKey: string) => {
        if (!conversationKey) {
            return
        }
        const resp = await queryMessageListAPI(conversationKey)
        // @ts-ignore
        const msgs: MessageInfo<AgentMessage>[] = resp.data.map((item) => ({
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
        setMessages(msgs)
    }

    useEffect(() => {
        console.log('activeConversationKey:', activeConversationKey)
        queryMessageList(activeConversationKey).then()
    }, [activeConversationKey]);


    // 发送消息
    const handleSubmitMsg = async (msg: string) => {
        setInputTxt('');
        setRequestLoading(true);
        let chatId: string | undefined = '';
        if (!activeConversationKey) {
            chatId = await addConversation(msg);
        }

        // 延时一会发起提问
        setTimeout(() => {
            onRequest({
                type: 'user',
                id: Date.now().toString(),
                chatId: chatId ? chatId : activeConversationKey,
                content: msg,
                openReasoning: openReasoning,
                openSearch: openSearch,
            });
        }, 500)

    }

    /* 自定义发送框底部 */
    const senderFooter = ({components}: any) => {
        const {SendButton, LoadingButton, SpeechButton} = components;

        return (
            <Flex justify='space-between' align='center'>
                <Flex gap='small'>
                    <Tooltip
                        title={openReasoning ? '' : '调用新模型 DeepSeek-R1，解决推理问题'}
                        placement='left'
                    >
                        <Button
                            size='small'
                            shape='round'
                            type={openReasoning ? 'primary' : 'default'}
                            onClick={() => setOpenReasoning(!openReasoning)}
                        >
                            <NodeIndexOutlined/>
                            深度思考
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title={openSearch ? '' : '按需搜索网页'}
                        placement='right'
                    >
                        <Button
                            size='small'
                            shape='round'
                            type={openSearch ? 'primary' : 'default'}
                            onClick={() => setOpenSearch(!openSearch)}
                        >
                            <GlobalOutlined/>
                            联网搜索
                        </Button>
                    </Tooltip>
                </Flex>

                <Flex align='center' gap='small'>
                    <Tooltip title={'上传附件'} placement='top'>
                        <Button
                            type='text'
                            icon={<PaperClipOutlined rotate={135} style={{fontSize: '18px', marginTop: '7px'}}/>}
                        />
                    </Tooltip>
                    {
                        !agent.isRequesting() ?
                            (
                                <Tooltip title={inputTxt ? '发送' : '请输入你的问题'}>
                                    <SendButton/>
                                </Tooltip>)
                            : (
                                <Tooltip title='停止'>
                                    <LoadingButton/>
                                </Tooltip>
                            )
                    }
                </Flex>

            </Flex>
        );
    }


    // 停止
    const handleCancel = () => {
        setRequestLoading(false);
        abortControllerRef.current?.abort('手动停止');
        apiMessage.error('已停止')
    }

    // 通过 useEffect 清理函数自动取消未完成的请求：
    useEffect(() => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        return () => {
            controller.abort('组件卸载，取消请求');
        };
    }, []);

    return (
        <XProvider
            locale={zhCN}
            theme={customTheme}
        >
            <ProLayout
                className='h-lvh'
                token={proLayoutToken}
                pure={false} // 是否删除自带页面
                navTheme={'light'}
                layout={'side'}
                siderWidth={250}
                logo={<Logo/>}
                title={appConfig.appName}
                menuHeaderRender={menuHeaderRender} // Logo Title
                menuExtraRender={addConversationRender} // 开启新对话按钮
                menuContentRender={conversationRender} // 会话管理
                actionsRender={actionsRender}
                avatarProps={avatarRender} // 用户头像
                footerRender={() => (<Footer/>)}  // 页脚

                collapsedButtonRender={false} // 去掉默认侧边栏
                collapsed={collapsed}
                onCollapse={setCollapsed}
            >
                <div className='fixed z-10 h-12 w-12'>
                    {SidebarTrigger}
                </div>

                <Flex
                    vertical
                    gap={'large'}
                    className='w-full'
                    style={{margin: '0px auto', height: '94.5vh'}}
                >
                    {/* 消息列表 */}
                    <div className='h-full w-full px-1 overflow-y-auto scrollbar-container'>
                        <Bubble.List
                            className='max-w-2xl  mx-auto'
                            items={messageItems}
                        />
                    </div>

                        {/* 输入框 */}
                        <Sender
                            className='max-w-2xl mx-auto'
                            style={{marginTop: 'auto', borderRadius: '20px'}}
                            autoSize={{minRows: 2, maxRows: 8}}
                            placeholder='请输入你的问题...'
                            loading={agent.isRequesting()}
                            value={inputTxt}
                            onChange={setInputTxt}
                            onSubmit={handleSubmitMsg}
                            onCancel={handleCancel}
                            actions={false}
                            footer={senderFooter}
                        />
                </Flex>
            </ProLayout>
        </XProvider>
);
};

export default ChatPage;