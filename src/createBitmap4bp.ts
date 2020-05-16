import fs from "fs";
import Bitmap4bp from "./Bitmap4bp";
import Bitmap, { BITMAP_COLORTABLE_4GRAY } from "./Bitmap";

var img:Bitmap4bp = Bitmap4bp.create(10,10,BITMAP_COLORTABLE_4GRAY);
//var img: Bitmap4bp = Bitmap4bp.create(10, 10);
var img2: Bitmap4bp = new Bitmap4bp(fs.readFileSync('./valid4bpp.bmp'));
console.log("Generated");
console.log(img.fileHeader);
console.log(img.infoHeader);
img.printColorTable();
console.log("Loaded");
console.log(img2.fileHeader);
console.log(img2.infoHeader);
img2.printColorTable();
img.setPixel(0, 1, 0);
console.log(img.getPixel(0, 1));
img.setPixel(1, 1, 1);
console.log(img.getPixel(1, 1));
img.setPixel(2, 1, 2);
console.log(img.getPixel(2, 1));
img.setPixel(3, 1, 3);
console.log(img.getPixel(3, 1));


fs.writeFileSync('./test.bmp', img.rawData);