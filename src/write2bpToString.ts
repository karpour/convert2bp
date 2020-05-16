import Bitmap2bp from "./Bitmap2bp";


let m = [
    '  ',
    '░░',
    '▒▒',
    '██'
];

export default function write2bpToString(img: Bitmap2bp): string {
    let lines: string[] = [];
    /*let newImage = Buffer.alloc(img.width * img.height);

    for (let j = 0; j < img.imageContentBuffer.byteLength; j++) {
        let bt = img.imageContentBuffer.readInt8(j);
        let offset = j * 4;
        newImage.writeInt8((bt >> 6) & 0x03, offset);
        newImage.writeInt8((bt >> 4) & 0x03, offset + 1);
        newImage.writeInt8((bt >> 2) & 0x03, offset + 2);
        newImage.writeInt8((bt >> 0) & 0x03, offset + 3);
    }

    for (let y = img.height - 1; y >= 0; y--) {
        let line = "";
        for (let x = 0; x < img.width; x++) {
            line += m[newImage.readUInt8(y * img.width + x)];
        }
        lines.push(line);
    }*/

    for (let y = 0; y < img.height; y++) {
        let line = "";
        for (let x = 0; x < img.width; x++) {
            line += m[img.getPixel(x,y)];
            //line += new Number(img.getPixel(x,y)).toString(2)+",";
            
        }
        lines.push(line);
    }
    return lines.join('\n');
}