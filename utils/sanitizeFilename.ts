export const sanitizeFilename = (url: string): string => {
        return url
                .replace(/^https?:\/\//, '')
                .replace(/[^a-z0-9]/gi, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase();
};
