import React from 'react';
import {ProLayoutProps} from "@ant-design/pro-components";
import {LogoutOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import {cleanLoginUserCookie, getLoginUserCookie} from "@/app/actions";
import {useRouter} from "next/navigation";
import {logoutAPI} from "@/utils/user-api";
import {type AvatarProps, Dropdown, MenuProps, message} from "antd";


/**
 * 头像下拉组件
 */
const AvatarDropdown = (
    {children}: { children: React.ReactNode }
) => {

    const router = useRouter();

    const handleLogout = async () => {
        const resp = await logoutAPI()
        if (resp.code == 200) {
            await cleanLoginUserCookie()
            router.push('/login')
        } else {
            message.error(resp.message)
        }
    }

    // 用户头像下拉菜单项
    const items: MenuProps['items'] = [
        {
            key: 'setting',
            label: '个人设置',
            icon: (<SettingOutlined/>),
        },
        {
            key: 'logout',
            //label: (<Link href='/login'>{'退出登录'}</Link>),
            label: (
                <div onClick={handleLogout}>
                    {'退出登录'}
                </div>
            ),
            icon: (<LogoutOutlined/>),
        },

    ]

    return (
        <div>
            <Dropdown
                menu={{items}}
                placement={'bottom'}
            >
                {children}
            </Dropdown>

        </div>
    );
};

const getUsername = async () => {
    const loginUser = await getLoginUserCookie();
    return loginUser?.username || 'User'
}


/**
 * 用户头像渲染
 */
export const avatarRender: ProLayoutProps['avatarProps'] = {
    icon: (<UserOutlined/>),
    size: 'small',
    title: (<>{await getUsername()}</>),
    render: (avatarProps: AvatarProps, avatarChildren: React.ReactNode) => {
        return (<AvatarDropdown>{avatarChildren}</AvatarDropdown>);
    },
}
