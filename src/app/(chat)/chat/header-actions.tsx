import React from 'react';
import {HeaderViewProps} from "@ant-design/pro-layout/es/components/Header";
import {Button} from "antd";
import {GithubFilled, MoonFilled, SunOutlined} from "@ant-design/icons";
import Link from "next/link";
import {useTheme} from "@/components/provider/theme-provider";

type HeaderActions = {
    headerProps: HeaderViewProps,
}

const HeaderActions = (props: HeaderActions) => {
    if (props.headerProps.isMobile) return [];

    const {isDark, toggleTheme} = useTheme();

    return [
        /* 亮暗模式切换 */
        <Button
            key='dark'
            type='text'
            shape='circle'
            onClick={toggleTheme}
        >
            {isDark() ?
                <MoonFilled style={{fontSize: '18px'}}/>
                : <SunOutlined style={{fontSize: '18px'}}/>
            }
        </Button>,

        /* Github */
        <Link
            key='github_link'
            href='https://github.com/dawei1898/dw-chat-web'
            target="_blank"
        >
            <Button key='github' type='text' shape='circle'>
                <GithubFilled style={{fontSize: '18px'}}/>
            </Button>
        </Link>,
    ];
};

export default HeaderActions;