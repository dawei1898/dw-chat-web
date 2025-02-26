"use client"
import React, {useEffect, useState} from 'react';
import useStyle from "@/app/chat/chat-styles";
import {
    Bubble,
    Conversations,
    ConversationsProps,
    Prompts,
    PromptsProps,
    Sender, useXAgent, useXChat,
    Welcome,
    XProvider
} from "@ant-design/x";
import Image from "next/image";
import {Button, GetProp, Space, Typography, message as apiMessage, Tooltip} from "antd";
import {
    CommentOutlined, CopyOutlined, DislikeFilled, DislikeOutlined,
    EllipsisOutlined, FireOutlined, HeartOutlined, LikeOutlined,
    PlusOutlined, ReadOutlined, SendOutlined,
    ShareAltOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import DeepSeekIcon from "@/app/chat/deep-seek-icon";
import OpenAI from "openai";
import {BubbleDataType} from "@ant-design/x/es/bubble/BubbleList";
import {ActionsRender} from "@ant-design/x/es/sender";
//import '@ant-design/v5-patch-for-react-19';


/*
const defaultConversationsItems: GetProp<ConversationsProps, 'items'> = Array.from({length: 1}).map((_, index) => ({
    key: `${index + 1}`,
    label: `Conversation Item ${index + 1}`,
}));
*/

const defaultConversationsItems: GetProp<ConversationsProps, 'items'> = []

const renderTitle = (icon: React.ReactElement, title: string) => (
    <Space align="start">
        {icon}
        <span>{title}</span>
    </Space>
);

const promptItems: PromptsProps['items'] = [
    {
        key: '1',
        label: renderTitle(<FireOutlined style={{color: '#FF4D4F'}}/>, 'Hot Topics'),
        description: 'What are you interested in?',
        children: [
            {
                key: '1-1',
                description: `What's new in X?`,
            },
            {
                key: '1-2',
                description: `What's AGI?`,
            },
            {
                key: '1-3',
                description: `Where is the doc?`,
            },
        ],
    },
    {
        key: '2',
        label: renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, 'Design Guide'),
        description: 'How to design a good product?',
        children: [
            {
                key: '2-1',
                icon: <HeartOutlined/>,
                description: `Know the well`,
            },
            {
                key: '2-2',
                icon: <SmileOutlined/>,
                description: `Set the AI role`,
            },
            {
                key: '2-3',
                icon: <CommentOutlined/>,
                description: `Express the feeling`,
            },
        ],
    }
];


/**
 * DeepSeek大模型配置
 */
const MODEL_CHAT = 'deepseek-chat'
const MODEL_REASONER = 'deepseek-reasoner'

const client = new OpenAI({
    baseURL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
    dangerouslyAllowBrowser: true,
});


const ChatPage = () => {
    const {styles} = useStyle();
    const [inputTxt, setInputTxt] = useState<string>('')
    const [requestLoading, setRequestLoading] = useState<boolean>(false)
    const [conversationsItems, setConversationsItems] = useState(defaultConversationsItems);
    const [activeKey, setActiveKey] = useState<string>('1')


    // 添加会话
    const addConversation = (msg: string) => {
        setConversationsItems([
            {
                key: `${conversationsItems.length + 1}`,
                label: msg,
            },
            ...conversationsItems,

        ]);
        setActiveKey(`${conversationsItems.length + 1}`);
    };


    // 发送消息
    const handleSubmit = (msg: string) => {
        onRequest(msg);
        setInputTxt('');
        setRequestLoading(true);
        if (!activeKey) {
            addConversation(msg);
        }
    }


    // Logo
    const LogoNode = (
        <Space
            className={styles.logo}
            size={'middle'} align={'start'}
        >
            <Image
                className="dark:invert"
                src="/dw-chat-logo.png"
                alt="dw chat logo"
                width={38}
                height={38}
                priority
            />
            <Typography.Title level={4}>
                DW Chat
            </Typography.Title>
        </Space>
    );

    // 初始态的欢迎语和提示词
    const placeholderNode = (
        <Space
            className={styles.placeholder}
            direction='vertical'
            size={16}
        >
            {/* 欢迎语 */}
            <Welcome
                variant="borderless"
                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                title="Hello, I'm Ant Design X"
                description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
                extra={
                    <Space>
                        <Button icon={<ShareAltOutlined/>}/>
                        <Button icon={<EllipsisOutlined/>}/>
                    </Space>
                }
            />
            {/* 提示词 */}
            <Prompts
                title={'Do you want?'}
                items={promptItems}
                styles={{
                    list: {
                        width: '100%',
                    },
                    item: {
                        flex: 1,
                    }
                }}
                onItemClick={({data}) => {
                    if (data.description) {
                        handleSubmit(data.description.toString())
                    }
                }}
            />
        </Space>
    );


    /**
     * 与大模型交互
     */
    const abortController = new AbortController();
    const [agent] = useXAgent({
        request: async (info, callbacks) => {
            const {message, messages} = info
            const {onUpdate, onSuccess, onError} = callbacks
            console.log('message', message)
            console.log('message list', messages)

            let content = ''
            try {
                const streamCompletions = await client.chat.completions.create({
                        model: MODEL_CHAT,
                        messages: [{role: 'user', content: message || ''}],
                        stream: true
                    },
                    {
                        signal: abortController.signal, // 控制停止
                    });
                for await (let chunk of streamCompletions) {
                    setRequestLoading(false);
                    content += chunk.choices[0]?.delta?.content;
                    onUpdate(content);
                }

                onSuccess(content);
            } catch (e) {
                console.log('error', e);
                onError(e as Error);
            } finally {
                setRequestLoading(false);
            }
        }
    });

    const {onRequest, messages, setMessages} = useXChat({
        agent: agent,
        requestPlaceholder: '请求中...',
    });

    /*useEffect(() => {
        setMessages([])
    }, [activeKey]);*/

    // 点击添加会话
    const clickAddConversation = () => {
        setActiveKey('')
        setMessages([])
    }


    // 停止
    const handleCancel = () => {
        setRequestLoading(false);
        // 终止请求
        abortController.abort()
        apiMessage.error('已停止')
    }


    const MessageFooter = (
        <Space>
            <Tooltip title='喜欢'>
                <Button
                    size={'small'} type={'text'} icon={<LikeOutlined/>}
                    onClick={() => apiMessage.success('感谢您的支持')}
                />
            </Tooltip>
            <Tooltip title='不喜欢'>
                <Button
                    size={'small'} type={'text'} icon={<DislikeOutlined/>}
                    onClick={() => apiMessage.info('感谢您的反馈')}
                />
            </Tooltip>
            <Tooltip title='复制'>
                <Button
                    size={'small'} type={'text'} icon={<CopyOutlined/>}
                    onClick={() => apiMessage.success('已复制')}
                />
            </Tooltip>
        </Space>
    )

    // 角色格式设定
    const roles: GetProp<typeof Bubble.List, 'roles'> = {
        ai: {
            placement: 'start',
            avatar: {icon: <DeepSeekIcon/>, style: {border: '1px solid #c5eaee', backgroundColor: 'white'}},
            footer: !agent.isRequesting() && MessageFooter,
            typing: {step: 5, interval: 50},
            style: {
                maxWidth: 700,
            },
            /*styles: {
                footer: {marginLeft: "auto"}
            }*/
        },
        user: {
            placement: 'end',
            variant: 'outlined',
        },
    };

    const messageItems = messages.map((
        {id, message, status}) =>
        ({
            key: id,
            content: message,
            role: status === 'local' ? 'user' : 'ai',
            loading: status === 'loading' && requestLoading,
        }));

    const finalMessageItems: BubbleDataType[] = messageItems.length > 0
        ? messageItems : [{content: placeholderNode, variant: 'borderless'}];

    /* 自定义发送按钮 */
    const senderActions: ActionsRender = (_, info) => {
        const {SendButton, LoadingButton} = info.components;
        return (
            agent.isRequesting() ? (
                <Tooltip title='停止'>
                    <LoadingButton/>
                </Tooltip>
            ) : (
                <Tooltip title={inputTxt ? '发送' : '请输入你的问题'}>
                    <SendButton icon={<SendOutlined rotate={315}/>}/>
                </Tooltip>
            )
        )
    };


    return (
        <XProvider>
            <div className={styles.layout}>
                <div className={styles.sider}>
                    {/* Logo */}
                    {LogoNode}

                    {/* 添加会话 */}
                    <div>
                        <Button
                            className={styles.addButton}
                            type={'link'}
                            icon={<PlusOutlined/>}
                            onClick={clickAddConversation}
                        >
                            新建对话
                        </Button>
                    </div>

                    {/* 会话管理 */}
                    <div>
                        <Conversations
                            className={styles.conversations}
                            items={conversationsItems}
                            activeKey={activeKey}
                            onActiveChange={setActiveKey}

                        />
                    </div>

                </div>
                <div className={styles.chat}>
                    {/* 消息列表 */}
                    <Bubble.List
                        roles={roles}
                        items={finalMessageItems}
                    />

                    {/* 输入框 */}
                    <Sender
                        className={styles.sender}
                        placeholder='请输入你的问题...'
                        loading={agent.isRequesting()}
                        value={inputTxt}
                        onChange={setInputTxt}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        actions={senderActions}
                        styles={{
                            input: {minHeight: 75}
                        }}
                    />
                </div>

            </div>
        </XProvider>
    );
};

export default ChatPage;