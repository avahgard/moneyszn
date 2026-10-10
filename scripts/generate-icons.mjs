// Temporary geometric M icons; no external artwork or runtime dependency.
import { deflateSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, checksum]);
}
function png(size) {
  const rows = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const inStem =
        ((u > 0.23 && u < 0.33) || (u > 0.67 && u < 0.77)) &&
        v > 0.23 &&
        v < 0.77;
      const inDiagonal =
        u >= 0.3 &&
        u <= 0.7 &&
        Math.abs(v - (0.25 + 1.2 * Math.min(u - 0.3, 0.7 - u))) < 0.065;
      const color = inStem || inDiagonal ? [242, 245, 243] : [22, 54, 46];
      const index = y * (size * 3 + 1) + 1 + x * 3;
      color.forEach((channel, i) => {
        rows[index + i] = channel;
      });
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
mkdirSync('public/icons', { recursive: true });
for (const [name, size] of [
  ['icon-192', 192],
  ['icon-512', 512],
  ['apple-touch-icon', 180],
]) {
  writeFileSync(`public/icons/${name}.png`, png(size));
}
