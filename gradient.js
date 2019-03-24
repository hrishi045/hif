const lzma = require('lzma-native');
const fs = require('fs');

const outfile = process.argv[2];

const magicNumbers = Buffer.from([0xDE, 0xAD, 0xFA, 0xCE]);

const fileSize = Buffer.from([0x00, 0x01, 0x00, 0x01]);

const data = [];

for (let i = 0; i < 0xff; i++) {
  for (let j = 0; j < 0xff; j++) {
    data.push(i);
    data.push(j);
    data.push(0x00);
  }
}

const dataBuf = Buffer.from(data);

lzma.LZMA().compress(dataBuf, 0, (zbuf) => {
  const final = Buffer.concat([magicNumbers, fileSize, zbuf]);
  fs.writeFile(outfile, final, (err) => {
    if (err) console.error("Error writing file");
    console.log("Wrote successfully");
  });
});
