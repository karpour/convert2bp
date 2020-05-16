import Bitmap, { BITMAP_COLORTABLE_4GRAY, BitmapScanRowOrder } from "./Bitmap";
import Bitmap4bp from "./Bitmap4bp";
import BitmapGrayscale from './BitmapGrayscale';

type Bitmap2bpPixelValue = 0 | 1 | 2 | 3;

export default class Bitmap2bp extends Bitmap implements BitmapGrayscale {
    public static readonly BLACK: Bitmap2bpPixelValue = 0;
    public static readonly GRAY33: Bitmap2bpPixelValue = 1;
    public static readonly GRAY66: Bitmap2bpPixelValue = 2;
    public static readonly WHITE: Bitmap2bpPixelValue = 3;

    public constructor(buffer: Buffer) {
        super(buffer);
    }

    public setPixel(x: number, y: number, value: Bitmap2bpPixelValue) {
        let xByte = x >> 2;
        let shift = 6 - ((x & 0x03) << 1);
        let v = (value & 0x03) << shift;
        let bitMask = 0x03 << shift;
        let row = (this.scanRowOrder == BitmapScanRowOrder.BOTTOM_TO_TOP) ? (this.height - 1 - y) : y;
        let oldVal = this._imgContentBuffer.readUInt8(row * this._stride + xByte);
        let newVal = (oldVal & ~bitMask) | v;
        this._imgContentBuffer.writeUInt8(newVal, row * this._stride + xByte);
    }

    public getPixel(x: number, y: number): Bitmap2bpPixelValue {
        //console.log(`Bitmap2bp.getPixel(${x},${y});`);
        let xByte = x >> 2;
        //console.log(`  xByte = ${xByte}`);
        let shift = (3 - (x & 0x03)) * 2;
        let bitMask = 0x03 << shift;
        let row = (this.scanRowOrder == BitmapScanRowOrder.BOTTOM_TO_TOP) ? (this.height - 1 - y) : y;
        return (this._imgContentBuffer.readUInt8(row * this._stride + xByte) & bitMask) >> shift as Bitmap2bpPixelValue;
    }

    public convertTo4bp(): Bitmap4bp {
        let bitmap4bp = Bitmap4bp.create(this.width, this.height, BITMAP_COLORTABLE_4GRAY);
        // TODO write more efficient conversion code
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                bitmap4bp.setPixel(x, y, this.getPixel(x, y));
            }
        }
        return bitmap4bp;
    }

    get bitsPerPixel(): number {
        return 2;
    }

    public get hasAlpha(): boolean {
        return false;
    }
}