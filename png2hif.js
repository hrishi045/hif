const lzma = require('lzma-native');
const fs = require('fs');
const PNGReader = require('png.js');

const infile = process.argv[2];
const outfile = process.argv[3];

const magicNumbers = Buffer.from([0xDE, 0xAD, 0xFA, 0xCE]);

const pngbuf = fs.readFileSync(infile);

const pngreader = new PNGReader(pngbuf);

pngreader.parse((err, png) => {
  if (err) console.log(err);
  let pngWidth = png.getWidth();
  let pngHeight = png.getHeight();

  const fileSizeArr = [];
  fileSizeArr.push(pngWidth % 256);
  pngWidth /= 256;
  fileSizeArr.push(pngWidth);
  fileSizeArr.push(pngHeight % 256);
  pngHeight /= 256;
  fileSizeArr.push(pngHeight);

  const fileSize = Buffer.from(fileSizeArr);

  let data = [];

  for (let i = 0; i < png.getWidth() - 0; i++) {
    for (let j = 0; j < png.getHeight() - 0; j++) {
      const [r, g, b] = png.getPixel(i, j);
      data.push(r);
      data.push(g);
      data.push(b);
    }
  }

  const dataBuf = Buffer.from(data);

  console.log(dataBuf);

  lzma.LZMA().compress(dataBuf, 9, (zbuf) => {
    const final = Buffer.concat([magicNumbers, fileSize, zbuf]);
    console.log(final);
    fs.writeFile(outfile, final, (err) => {
      if (err) console.error("Error writing file");
      console.log("Wrote successfully");
    });
  });
});

