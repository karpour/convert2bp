import Bitmap from "./Bitmap";

export default class Bitmap1bp extends Bitmap {
    get bitsPerPixel(): number {
        throw new Error("Method not implemented.");
    }
    public constructor(buffer: Buffer) {
        super(buffer);
    }
    public get hasAlpha(): boolean {
        return false;
    }
}