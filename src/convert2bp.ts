#!/bin/node

import fs from 'fs';
import parseArgs from './parseArgs';
import printUsage from './parseArgs';
import getStdIn from './getStdIn';
import Bitmap2bp from './Bitmap2bp';
import Bitmap4bp from './Bitmap4bp';



async function main() {
    var args = parseArgs();
    let buffer!: Buffer;
    let bitmap2bp!: Bitmap2bp;
    let bitmap4bp!: Bitmap4bp;

    //console.log(args);
    if (args.inputFile) {
        buffer = fs.readFileSync(args.inputFile);
    } else {
        //console.log("Getting stdin")
        let stdInBuffer: Buffer | undefined = await getStdIn();
        if (stdInBuffer != undefined) {
            buffer = stdInBuffer;
        } else {
            console.error("error: no input file but also no input pipe supplied");
            printUsage();
            process.exit(1);
        }
    }

    try {
        bitmap2bp = new Bitmap2bp(buffer);
        bitmap4bp = bitmap2bp.convertTo4bp();
    } catch (err) {
        console.log(`error: ${err}`);
        process.exit(1);
    }

    if (args.outputFile) {
        if (fs.existsSync(args.outputFile) && !args.force) {
            console.error("error: output file already exists");
            process.exit(1);
        }
        fs.writeFileSync(args.outputFile, bitmap4bp.rawData);
    } else if (!process.stdout.isTTY) {
        process.stdout.write(bitmap4bp.rawData);
    } else {
        console.error("error: no output file given, and no output pipe present");
        printUsage();
        process.exit(1);
    }
}

main();
