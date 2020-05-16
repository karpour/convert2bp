

export type BitmapColorTableEntry = { A: number, R: number, G: number, B: number; };

const WHITE: BitmapColorTableEntry = { A: 0xFF, R: 0xFF, G: 0xFF, B: 0xFF };
const BLACK: BitmapColorTableEntry = { A: 0x00, R: 0x00, G: 0x00, B: 0x00 };
const GRAY66: BitmapColorTableEntry = { A: 0xAA, R: 0xAA, G: 0xAA, B: 0xAA };
const GRAY33: BitmapColorTableEntry = { A: 0x55, R: 0x55, G: 0x55, B: 0x55 };

export const BITMAP_COLORTABLE_4GRAY = [BLACK, GRAY33, GRAY66, WHITE];


export default abstract class Bitmap {
    public static readonly BITMAP_FILE_HEADER_SIZE = 14;
    public static readonly BITMAP_INFO_HEADER_SIZE = 40;
    public static readonly BF_TYPE: number = 19778;
    protected _fileHeader: BitmapFileHeader;
    protected _infoHeader: BitmapInfoHeader;
    protected _buffer: Buffer;
    protected _imgContentBuffer: Buffer;
    protected _stride: number;

    protected constructor(buffer: Buffer) {
        this._buffer = buffer;
        this._fileHeader = Bitmap.readBitmapFileHeader(buffer);
        this._infoHeader = Bitmap.readBitmapInfoHeader(buffer);
        this._imgContentBuffer = this.imageContentBuffer;
        this._stride = Bitmap.widthToStride(this.width, this._infoHeader.biBitCount);
        if (this._fileHeader.bfType != Bitmap.BF_TYPE) throw new Error("File is missing the BM file identifier at offset 0");
        this.checkBPP();

        // TODO check file size
    }

    private checkBPP() {
        if (this._infoHeader.biBitCount != this.bitsPerPixel) throw new Error(`Color depth is not ${this.bitsPerPixel} bpp`);
    }

    //public create(width: number, height: number): Bitmap;

    // Could implement this if all formats are supported
    /*public createFromBuffer(buffer: Buffer) {
        let biBitCount = buffer.readUInt16LE(28);
        switch (biBitCount) {
            case 2:
                return new Bitmap2bp(buffer);
            case 1:
            case 4:
            case 8:
            case 16:
            case 24:
            case 32:
                break;
            default:
                throw new Error(`Unsupported bits per pixel: ${biBitCount}`);
        }
    }*/

    public decode(data: Buffer) {

    }

    public encode(data: Buffer) {

    }

    get fileHeaderSize():number {
        return Bitmap.BITMAP_FILE_HEADER_SIZE;
    }

    get infoHeaderSize():number {
        return this.infoHeader.biSize;
    }

    get imageContentBuffer(): Buffer {
        return this._buffer.subarray(this._fileHeader.bfOffBits, this._fileHeader.bfOffBits + this._infoHeader.biSizeImage);
    }

    get imageOffset():number {
        return this._fileHeader.bfOffBits;
    }

    public get rawData(): Buffer {
        return this._buffer;
    }

    abstract get bitsPerPixel(): number;

    get stride() {
        return this._stride;
    }

    get width(): number {
        return this._infoHeader.biWidth;
    }

    get height(): number {
        return this._infoHeader.biHeight;
    }

    get fileHeader(): BitmapFileHeader {
        return this._fileHeader;
    }

    get infoHeader(): BitmapInfoHeader {
        return this._infoHeader;
    }

    get scanRowOrder(): BitmapScanRowOrder {
        return this._infoHeader.biHeight > 0 ? BitmapScanRowOrder.BOTTOM_TO_TOP : BitmapScanRowOrder.TOP_TO_BOTTOM;
    }

    public abstract get hasAlpha(): boolean;

    public static readBitmapFileHeader(buf: Buffer): BitmapFileHeader {
        return {
            bfType: buf.readUInt16LE(0),
            bfSize: buf.readUInt32LE(2),
            bfReserved1: buf.readUInt16LE(6),
            bfReserved2: buf.readUInt16LE(8),
            bfOffBits: buf.readUInt32LE(10)
        };
    }

    public static readBitmapInfoHeader(buf: Buffer): BitmapInfoHeader {
        return {
            biSize: buf.readUInt32LE(14),
            biWidth: buf.readInt32LE(18),
            biHeight: buf.readInt32LE(22),
            biPlanes: buf.readUInt16LE(26),
            biBitCount: buf.readUInt16LE(28),
            biCompression: buf.readUInt32LE(30),
            biSizeImage: buf.readUInt32LE(34),
            biXPelsPerMeter: buf.readInt32LE(38),
            biYPelsPerMeter: buf.readInt32LE(42),
            biClrUsed: buf.readUInt32LE(46),
            biClrImportant: buf.readUInt32LE(50),
        };
    }


    private static writeBitmapFileHeader(buf: Buffer, fileHeader: BitmapFileHeader) {
        buf.writeUInt16LE(fileHeader.bfType, 0);
        buf.writeUInt32LE(fileHeader.bfSize, 2);
        buf.writeUInt16LE(fileHeader.bfReserved1, 6);
        buf.writeUInt16LE(fileHeader.bfReserved2, 8);
        buf.writeUInt32LE(fileHeader.bfOffBits, 10);
    }

    private static writeBitmapInfoHeader(buf: Buffer, infoHeader: BitmapInfoHeader) {
        buf.writeUInt32LE(infoHeader.biSize, 14);
        buf.writeInt32LE(infoHeader.biWidth, 18);
        buf.writeInt32LE(infoHeader.biHeight, 22);
        buf.writeUInt16LE(infoHeader.biPlanes, 26);
        buf.writeUInt16LE(infoHeader.biBitCount, 28);
        buf.writeUInt32LE(infoHeader.biCompression, 30);
        buf.writeUInt32LE(infoHeader.biSizeImage, 34);
        buf.writeInt32LE(infoHeader.biXPelsPerMeter, 38);
        buf.writeInt32LE(infoHeader.biYPelsPerMeter, 42);
        buf.writeUInt32LE(infoHeader.biClrUsed, 46);
        buf.writeUInt32LE(infoHeader.biClrImportant, 50);
    }

    static createBuffer(imageSize: number, fileHeader: BitmapFileHeader, infoHeader: BitmapInfoHeader): Buffer {
        let buffer = Buffer.alloc(imageSize, 0x00);
        Bitmap.writeBitmapInfoHeader(buffer, infoHeader);
        Bitmap.writeBitmapFileHeader(buffer, fileHeader);
        return buffer;
    }

    static widthToStride(width: number, bpp: number) {
        //console.log(`widthToStride(${width},${bpp})`);
        let bitsPerRow = width * bpp;
        //console.log(`  bitsPerRow = ${bitsPerRow}`);
        let bytesPerRow = (bitsPerRow % 8 ? (bitsPerRow - bitsPerRow % 8) + 8 : bitsPerRow) >> 3;
        //console.log(`  bytesPerRow = ${bytesPerRow}`);
        if (bytesPerRow % 4) return (bytesPerRow - bytesPerRow % 4) + 4;
        return bytesPerRow;
    }
}

export enum BitmapScanRowOrder {
    BOTTOM_TO_TOP = 0,
    TOP_TO_BOTTOM = 1
}

export interface BitmapFileHeader {
    /** The header field used to identify the BMP and DIB file is 0x42 0x4D in hexadecimal, same as BM in ASCII. (2 bytes) */
    bfType: number;
    /** The size of the BMP file in bytes (4 bytes) */
    bfSize: number;
    /** Reserved; actual value depends on the application that creates the image (2 bytes) */
    bfReserved1: number;
    /** Reserved; actual value depends on the application that creates the image (2 bytes) */
    bfReserved2: number;
    /** The offset, i.e. starting address, of the byte where the bitmap image data (pixel array) can be found. (4 bytes) */
    bfOffBits: number;
}

export interface BitmapInfoHeader {
    /** The size of this header, in bytes (40) (4 bytes) */
    biSize: number;
    /** The bitmap width in pixels (signed integer) (4 bytes) */
    biWidth: number;
    /** The bitmap height in pixels (signed integer) (4 bytes) */
    biHeight: number;
    /** The number of color planes (must be 1) (2 bytes) */
    biPlanes: number;
    /** The number of bits per pixel, which is the color depth of the image. Typical values are 1, 4, 8, 16, 24 and 32. (2 bytes) */
    biBitCount: number;
    /** The compression method being used. See the next table for a list of possible values(4 bytes) */
    biCompression: number;
    /** The image size. This is the size of the raw bitmap data; a dummy 0 can be given for BI_RGB bitmaps. (4 bytes) */
    biSizeImage: number;
    /** The horizontal resolution of the image. (pixel per metre, signed integer) (4 bytes) */
    biXPelsPerMeter: number;
    /** The vertical resolution of the image. (pixel per metre, signed integer) (4 bytes) */
    biYPelsPerMeter: number;
    /** The number of colors in the color palette, or 0 to default to 2n (4 bytes) */
    biClrUsed: number;
    /** The number of important colors used, or 0 when every color is important; generally ignored (4 bytes) */
    biClrImportant: number;
}


