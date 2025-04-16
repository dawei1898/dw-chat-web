import React from 'react';
import {useAuth} from "@/components/provider/auth-provider";
import {Dropdown, MenuProps} from "antd";
import {LogoutOutlined, SettingOutlined} from "@ant-design/icons";


/**
 * 头像下拉组件
 */
const AvatarDropdown = (
    {children}: { children: React.ReactNode }
) => {
    const {user, logout} = useAuth();

    // 用户头像下拉菜单项
    const items: MenuProps['items'] = [
        {
            key: 'setting',
            label: '个人设置',
            icon: (<SettingOutlined/>),
        },
        {
            key: 'logout',
            label: (
                <div onClick={logout}>
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

export default AvatarDropdown;