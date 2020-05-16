import Bitmap from "./Bitmap";

export default class Bitmap1bp extends Bitmap {
    public constructor(buffer: Buffer) {
        super(buffer);
    }
    public get hasAlpha(): boolean {
        return false;
    }
}