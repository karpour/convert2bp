// Buffer for the jpg data
var buf = getImageResult.imagebuffer;
// Create an HTML img tag
var imageElem = document.createElement('img');
// Just use the toString() method from your buffer instance
// to get date as base64 type
imageElem.src = 'data:image/jpeg;base64,' + buf.toString('base64');