/**
 * 生成UUID
 */
export const buildUUID = () => {
    return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}