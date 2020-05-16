export default function getStdIn(): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
        if(process.stdin.isTTY) {
            console.log("stdin is tty");
            resolve(undefined);
            return;
        }
        let buffer: Buffer | undefined = undefined;
        process.stdin.on('readable', () => {
            let data = process.stdin.read();
            if (data instanceof Buffer) {
                if (!buffer) {
                    buffer = data;
                } else {
                    buffer = Buffer.concat([buffer, data]);
                }
            }
        });
        process.stdin.on('end', () => {
            resolve(buffer);
        });
    });
}