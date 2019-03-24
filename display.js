const hifs = document.getElementsByTagName("hif");

for (let i = 0; i < hifs.length; i++) {
  displayHif(hifs[i]);
}

function displayHif(hif) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  
  const path = hif.getAttribute('path');

  fetch(path)
    .then((data) => data.blob())
    .then((blob) => convertToUint8(blob))
    .then((buf) => initCanvas(buf, hif, c, ctx))
    .then((data) => uncompress(data))
    .then((unz) => render(unz, ctx));
}

function convertToUint8(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(blob);
    fr.addEventListener('loadend', (e) => {
      const uint8buf = new Uint8Array(e.target.result);
      resolve(uint8buf);
    });  
  });
}

function initCanvas(buf, hif, c, ctx) {
  const magic = buf.slice(0, 4);

  if (!(magic[0] === 0xDE &&
    magic[1] === 0xAD &&
    magic[2] === 0xFA &&
    magic[3] === 0xCE))
      throw new Error("Not a HIF file");

  const size = buf.slice(4, 8);
  const width = size[0] + 256 * size[1];
  const height = size[2] + 256 * size[3];

  c.setAttribute("width", width);
  c.setAttribute("height", height);

  hif.appendChild(c);

  return buf.slice(8);
}

function uncompress(data) {
  return LZMA.decompress(data);
}

function render(unz, ctx) {
  unz = new Uint8Array(unz);
  let l = 0;
  for (let i = 0; i < 0xff; i++) {
    for (let j = 0; j < 0xff; j++) {
      const [r, g, b] = [unz[l++], unz[l++], unz[l++]];
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i, j, i+1, j+1);
    }
  }
}