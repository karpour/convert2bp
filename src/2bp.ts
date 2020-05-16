import fs from 'fs';
import Bitmap2bp from './Bitmap2bp';
import getStdIn from './getStdIn';
import write2bpToString from './write2bpToString';

async function main() {
    let stdInBuffer: Buffer | undefined = await getStdIn();
    let buffer!: Buffer;
    if (stdInBuffer) {
        buffer = stdInBuffer;
    } else {
        buffer = fs.readFileSync(process.argv[2]);
    }

    let img: Bitmap2bp = new Bitmap2bp(buffer);

    console.log(`  width = ${img.width}`);
    console.log(`  height = ${img.height}`);
    console.log(`  stride = ${img.stride}`);
    
    img.setPixel(0,1,0);
    img.setPixel(1,1,1);
    img.setPixel(2,1,2);
    img.setPixel(3,1,3);
    console.log(write2bpToString(img));

    //console.log(img.infoHeader)
}

main();