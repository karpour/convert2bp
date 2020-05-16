import Bitmap, { BitmapFileHeader, BitmapInfoHeader, BitmapColorTableEntry, BitmapScanRowOrder } from "./Bitmap";

type Bitmap4bpColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

function colorTableEntryToString(entry: BitmapColorTableEntry): string {
    return `{A:${entry.A}, R:${entry.R}, G:${entry.G}, B:${entry.B}}`;
}

export default class Bitmap4bp extends Bitmap {
    public static readonly BITMAP_COLOR_TABLE_SIZE = 64;
    protected _colorTableBuffer: Buffer;
    protected _colorTable: BitmapColorTableEntry[] = [];

    get bitsPerPixel(): number {
        return 4;
    }
    public constructor(buffer: Buffer) {
        super(buffer);
        //console.log(`New Bitmap4bp`);
        //console.log(`width = ${this.width}`);
        //console.log(`height = ${this.height}`);
        //console.log(`fileHeaderSize = ${this.fileHeaderSize}`);
        //console.log(`infoHeaderSize = ${this.infoHeaderSize}`);
        //console.log(`imageOffset = ${this.imageOffset}`);
        let colorTableOffset = this.fileHeaderSize + this.infoHeaderSize;
        let colorTableSize = this._fileHeader.bfOffBits - colorTableOffset;
        colorTableSize = Math.min(colorTableSize - (colorTableSize % 4), 64); // Color table size has to be a multiple of 4, as one entry is 4 bytes, With a maximum of 16 entries;
        //console.log(`colorTableSize = ${colorTableSize}`);
        let colorTableEntries = colorTableSize / 4;
        this._colorTableBuffer = this._buffer.subarray(this.fileHeaderSize + this.infoHeaderSize, this.fileHeaderSize + this.infoHeaderSize + colorTableSize);
        //console.log(`Colortable = subarray(${Bitmap.BITMAP_FILE_HEADER_SIZE + Bitmap.BITMAP_INFO_HEADER_SIZE},${this._fileHeader.bfOffBits})`);
        for (let i = 0; i < colorTableEntries; i++) {
            //console.log(`Color table item: [${i}] = ${colorTableEntryToString(this.getColorTableItem(i))}`);
            this._colorTable.push(this.getColorTableItem(i));
        }
    }

    get colorTable(): BitmapColorTableEntry[] {
        return this._colorTable;
    }

    public printColorTable() {
        this._colorTable.forEach((entry: BitmapColorTableEntry, index: number) => console.log(`[${index}] ${colorTableEntryToString(entry)}`));
    }

    protected getColorTableItem(index: number): BitmapColorTableEntry {
        //console.log(`getColorTableItem(${index})`);
        return {
            A: this._colorTableBuffer.readUInt8((index << 2) + 3),
            R: this._colorTableBuffer.readUInt8((index << 2) + 2),
            G: this._colorTableBuffer.readUInt8((index << 2) + 1),
            B: this._colorTableBuffer.readUInt8((index << 2)),
        };
    }

    protected setColorTableItem(index: number, entry: BitmapColorTableEntry) {
        //console.log(`setColorTableItem(${index})`);
        //console.log(`Color table item: [${index}] = ${colorTableEntryToString(entry)}`);
        this._colorTable[index] = entry;
        this._colorTableBuffer.writeUInt8(entry.A, (index << 2) + 3);
        this._colorTableBuffer.writeUInt8(entry.R, (index << 2) + 2);
        this._colorTableBuffer.writeUInt8(entry.G, (index << 2) + 1);
        this._colorTableBuffer.writeUInt8(entry.B, (index << 2));
    }

    public setPixel(x: number, y: number, value: Bitmap4bpColorIndex) {
        //console.log(`Bitmap4bp.setPixel(${x},${y});`);
        let xByte = x >> 1;
        let shift = 4 - ((x & 0x1) * 4);
        let v = (value & 0x0F) << shift;
        let bitMask = 0x0F << shift;
        let row = (this.scanRowOrder == BitmapScanRowOrder.BOTTOM_TO_TOP) ? (this.height - 1 - y) : y;
        let oldVal = this._imgContentBuffer.readUInt8(row * this._stride + xByte);
        let newVal = (oldVal & ~bitMask) | v;
        //console.log(`writeUInt8(${newVal}, ${row * this._stride + xByte});`)
        this._imgContentBuffer.writeUInt8(newVal, row * this._stride + xByte);
    }

    public getPixel(x: number, y: number): BitmapColorTableEntry {
        //console.log(`getPixel(${x},${y});`);
        let xByte = x >> 1;
        //console.log(`  xByte=${xByte}`);
        //console.log(`  x=${new Number(x).toString(2)}`);
        let shift = 4 - ((x & 0x1) * 4);
        //console.log(`  shift=${shift}`);
        let bitMask = 0x0F << shift;
        //console.log(`  bitMask=${new Number(bitMask).toString(2)}`);
        let row = (this.scanRowOrder == BitmapScanRowOrder.BOTTOM_TO_TOP) ? (this.height - 1 - y) : y;
        //console.log(`  row=${row}`);
        let pixelColorIdx = (this._imgContentBuffer.readUInt8(row * this._stride + xByte) & bitMask) >> shift;
        //console.log(`  pixelColorIdx=${pixelColorIdx}`);
        return this._colorTable[pixelColorIdx];
    }


    public get hasAlpha(): boolean {
        return false;
    }

    public static create(width: number, height: number, colorTable: BitmapColorTableEntry[] | undefined = undefined): Bitmap4bp {
        let imageDatasize = height * Bitmap.widthToStride(width, 4);
        let colTable: BitmapColorTableEntry[] | undefined = colorTable;
        if (colorTable && colorTable.length > 16) {
            colTable = colorTable.splice(16);
        }
        let colorTableSize: number = colTable ? colTable.length * 4 : 0;
        let imageOffset = Bitmap.BITMAP_FILE_HEADER_SIZE + Bitmap.BITMAP_INFO_HEADER_SIZE + Bitmap4bp.BITMAP_COLOR_TABLE_SIZE;
        let imageSize = imageOffset + imageDatasize;
        let fileHeader: BitmapFileHeader = {
            bfType: Bitmap.BF_TYPE,
            bfSize: imageSize,
            bfReserved1: 0,
            bfReserved2: 0,
            bfOffBits: imageOffset
        };
        let infoHeader: BitmapInfoHeader = {
            biSize: 40,
            biWidth: width,
            biHeight: height,
            biPlanes: 1,
            biBitCount: 4,
            biCompression: 0,
            biSizeImage: imageDatasize,
            biXPelsPerMeter: 0,
            biYPelsPerMeter: 0,
            biClrUsed: colorTableSize,
            biClrImportant: colorTableSize,
        };
        let buffer: Buffer = Bitmap.createBuffer(imageSize, fileHeader, infoHeader);
        let bitmap = new Bitmap4bp(buffer);
        if (colTable) colTable.forEach((entry: BitmapColorTableEntry, index: number) => bitmap.setColorTableItem(index, entry));
        //bitmap.colorTable.forEach((v:BitmapColorTableEntry,i:number) => console.log(`[${i}]: ${colorTableEntryToString(v)}`));
        return bitmap;
    }
}
