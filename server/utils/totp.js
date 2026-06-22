import crypto from 'crypto';

// RFC 4648 Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(encoded) {
  let bits = 0, value = 0;
  const bytes = [];
  const str = encoded.replace(/=+$/, '').toUpperCase();
  for (const char of str) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function base32Encode(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function generateSecret(bytes = 20) {
  return base32Encode(crypto.randomBytes(bytes));
}

export function generateTOTP(secret, { digits = 6, period = 30, time = Date.now() } = {}) {
  const counter = Math.floor(time / 1000 / period);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, digits);
  return String(code).padStart(digits, '0');
}

export function verifyTOTP(token, secret, { digits = 6, period = 30, window = 1 } = {}) {
  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const expected = generateTOTP(secret, { digits, period, time: now + i * period * 1000 });
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token.trim()))) {
      return true;
    }
  }
  return false;
}

export function totpKeyUri({ label, issuer, secret, digits = 6, period = 30 }) {
  const params = new URLSearchParams({ secret, issuer, digits: String(digits), period: String(period) });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?${params}`;
}
