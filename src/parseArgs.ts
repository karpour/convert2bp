import { ArgumentParser } from 'argparse';

interface Covert2bpArgs {
    outputFile: string | null;
    inputFile: string | null;
    force: boolean;
}

var parser = new ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: '2bp to BMP converter'
});
parser.addArgument(
    ['-o', '--output-file'],
    {
        dest: 'outputFile',
        defaultValue: undefined,
        help: 'Converts a 2bp image to a 4bpp bmp file',
        required: false
    }
);
parser.addArgument(
    ['-f', '--force'],
    {
        dest: 'force',
        defaultValue: false,
        action: 'storeTrue',
        nargs: 0,
        help: 'Converts a 2bp image to a 4bpp bmp file',
        required: false
    }
);
parser.addArgument(
    ['INPUTFILE'],
    {
        nargs: '?',
        help: 'File to convert. File can also be piped into process',
        required: false
    }
);

export default function parseArgs(): Covert2bpArgs {
    let result = parser.parseArgs();
    return {
        outputFile: result.outputFile,
        inputFile: result.INPUTFILE ? result.INPUTFILE : null,
        force: result.force
    };
}

export var printUsage = parser.printUsage;
export var printHelp = parser.printHelp;