'use client'

import React, {useState} from 'react';
import type {CSSProperties} from 'react';
import {Space, Tabs, message, theme, Flex} from 'antd';
import '@ant-design/v5-patch-for-react-19'; // 兼容 React19
import {
    GithubOutlined,
    GoogleOutlined,
    LockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
    setAlpha,
} from '@ant-design/pro-components';
import {useRouter, useSearchParams} from "next/navigation";
import Logo from "@/app/(chat)/chat/logo";
import {appConfig} from "@/utils/appConfig";
import {useAuth} from "@/components/provider/auth-provider";


type LoginType = 'account' | 'email';


/**
 * 登录页
 */
const LoginPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const {token} = theme.useToken();
    const router = useRouter();
    const {login} = useAuth();
    const [loginType, setLoginType] = useState<LoginType>('account');

    //const searchParams = useSearchParams();
    //const redirect = searchParams.get('redirect') || '/';
    //console.log('redirect:', redirect)

    const iconStyles: CSSProperties = {
        marginInlineStart: '16px',
        color: setAlpha(token.colorTextBase, 0.2),
        fontSize: '24px',
        verticalAlign: 'middle',
        cursor: 'pointer',
    };


    // 执行登录操作
    const handleLogin = async (formData: Record<string, any>) => {
        const username: string = formData.username;
        const password: string = formData.password;


        const user = await login(username, password);
        if (user) {
            messageApi.success('登录成功')
            console.log('登录成功')
            router.push('/')
            //console.log('登录成功后跳回之前要去的页面:', redirect)
            //router.replace(redirect);
        } else {
            messageApi.error('登录失败')
            console.log('user is null')
        }
    }

    //const resp: ApiResponse<string> = await loginAction(username, password);

    /*const handleLogin2 = async (formData: Record<string, any>) => {
        const username: string = formData.username;
        const password: string = formData.password;
        console.log('执行成功: username: ' + username + ', password: ' + password);
        const resp = await loginAPI({username, password});
        if (resp.code === 200) {
            console.log('登录成功')
            // 使用 cookies 存储登录信息
            await setUserCookieAction(username, resp.data)
            message.success('登录成功')
            // 登录成功后跳回之前要去的页面
            router.push("/");
        } else {
            message.error(resp.message)
        }
    }*/


    return (
        <ProConfigProvider hashed={false}>
            {contextHolder}
            <Flex
                style={{
                    backgroundColor: token.colorBgContainer,
                    marginTop: '8%',
                }}
            >
                <LoginForm
                    logo={<Logo/>}
                    title={<span
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 ml-2">
                            {appConfig.appName}
                           </span>}
                    subTitle="AI 聊天页面"
                    actions={
                        <Space>
                            其他登录方式
                            <GithubOutlined style={iconStyles}/>
                            <GoogleOutlined style={iconStyles}/>
                        </Space>
                    }
                    onFinish={handleLogin}
                >
                    <Tabs
                        centered
                        activeKey={loginType}
                        onChange={(activeKey) => setLoginType(activeKey as LoginType)}
                        items={[
                            {
                                key: 'account',
                                label: '账号密码登录',
                            },
                            {
                                key: 'email',
                                label: '邮箱登录',
                            },
                        ]}
                    >
                    </Tabs>
                    {loginType === 'account' && (
                        <>
                            <ProFormText
                                name="username"
                                placeholder={'用户名: dawei'}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={'prefixIcon'}/>,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户名!',
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                placeholder={'密码: 123456'}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                    //strengthText: 'Password should contain numbers, letters and special characters, at least 8 characters long.',
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入密码！',
                                    },
                                ]}
                            />
                        </>
                    )}
                    {loginType === 'email' && (
                        <>
                            <ProFormText
                                name="email"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={'prefixIcon'}/>,
                                }}
                                placeholder={'邮箱: admin@gmail.com'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入邮箱!',
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={'prefixIcon'}/>,
                                    strengthText:
                                        'Password should contain numbers, letters and special characters, at least 8 characters long.',
                                    statusRender: (value) => {
                                        const getStatus = () => {
                                            if (value && value.length > 12) {
                                                return 'ok';
                                            }
                                            if (value && value.length > 6) {
                                                return 'pass';
                                            }
                                            return 'poor';
                                        };
                                        const status = getStatus();
                                        if (status === 'pass') {
                                            return (
                                                <div style={{color: token.colorWarning}}>
                                                    强度：中
                                                </div>
                                            );
                                        }
                                        if (status === 'ok') {
                                            return (
                                                <div style={{color: token.colorSuccess}}>
                                                    强度：强
                                                </div>
                                            );
                                        }
                                        return (
                                            <div style={{color: token.colorError}}>
                                                强度：弱
                                            </div>
                                        );
                                    },
                                }}
                                placeholder={'密码: 123456'}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入密码！',
                                    },
                                ]}
                            />
                        </>
                    )}
                    <div style={{marginBlockEnd: 24,}}>
                        <ProFormCheckbox noStyle name="autoLogin">
                            自动登录
                        </ProFormCheckbox>
                        <a style={{float: 'right',}}>
                            忘记密码
                        </a>
                    </div>
                </LoginForm>
            </Flex>
        </ProConfigProvider>
    );
};

export default LoginPage;