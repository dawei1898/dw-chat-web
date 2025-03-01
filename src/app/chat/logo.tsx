import React from 'react';
import {Space, Typography} from "antd";
import Image from "next/image";
import useStyle from "@/app/chat/chat-styles";

const Logo = () => {
    const {styles} = useStyle();

    return (
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
};

export default Logo;