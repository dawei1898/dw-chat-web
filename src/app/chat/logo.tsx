import React from 'react';
import {Flex, Space, Typography} from "antd";
import Image from "next/image";
import useStyle from "@/app/chat/chat-styles";

const Logo = () => {
    const {styles} = useStyle();

    return (
        <Flex
            className={styles.logo}
            gap={'middle'}
            align={'center'}
        >
            <Image
                className="dark:invert"
                src="/whale4.svg"
                alt="dw chat logo"
                width={38}
                height={38}
                priority
            />
            <Typography.Text strong style={{fontSize: '20px'}}>
                DwChat
            </Typography.Text>
        </Flex>
    );
};

export default Logo;