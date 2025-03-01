import {createStyles} from "antd-style";


/**
 * 样式
 */
const useStyle = createStyles(({ token, css }) => {
    return {
        layout: css`
            width: 100%;
            height: 100vh;
            display: flex;
            background-color: ${token.colorBgContainer};
            font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
        `,
        sider: css`
            width: 300px;
            height: 100%;
            padding: 10px;
            background: ${token.colorBgLayout}80;
      
        `,
        logo: css`
            margin-left: 24px;
        `,
        addButton: css`
            background-color: #1677ff0f;
            border: 1px solid #1677ff34;
            width: calc(100% - 25px);
            margin: 12px;
        `,
        conversations: css `
            padding: 0 12px;
            flex: 1;
            overflow-y: auto;
        `,
        chat: css`
            height: 98%;
            width: 100%;
            max-width: 700px;
            margin: 10px auto;
            padding: ${token.paddingLG}px;
            //box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 16px;
        `,
        placeholder: css`
            padding-top: 32px;
        `,
        welcome: css`
            
        `,
        prompts: css`
            
        `,

        messages: css`
            flex: 1;
        `,
        prefix: css`
             
            position: absolute;
            z-index: 1;
            bottom: 10px;
            
        `,
        sender: css`
            margin-top: auto;
            padding-bottom: 35px;
            border-radius: 20px;
            box-shadow: ${token.boxShadow};
        `,
    };
});

export default useStyle;