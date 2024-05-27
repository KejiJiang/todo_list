const crypto = require('crypto')

const secret = '0hmnf2e49ecc0af2c064b6a2lkjh673b19c090762a086d9a74e6339ebczz01po'

/**
 * https://blog.csdn.net/weixin_39639698/article/details/112181788
 */
const jwt = {
  sign(content, secret) {
    let r = crypto.createHmac('sha256', secret).update(content).digest('base64');
    return this.base64urlEscape(r)
  },
  base64urlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },
  toBase64(content) {
    return this.base64urlEscape(Buffer.from(JSON.stringify(content)).toString('base64'))
  },
  base64urlUnescape(str) {
    str += new Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
  },
  encode(payload, secret) {
    let header = this.toBase64({
      typ: 'JWT',
      alg: 'HS256'
    });
    let content = this.toBase64(payload);
    let sign = this.sign([header, content].join('.'), secret);
    return [header, content, sign].join('.')
  },
  decode(token, secret) {
    let [header, content, sign] = token.split('.');
    let newSign = this.sign([header, content].join('.'), secret);
    if (sign === newSign) {
      return Buffer.from(this.base64urlUnescape(content), 'base64').toString();
    } else {
      throw new Error('Invalid token')
    }
  }
}

const token = jwt.encode({
  uid: 20,
  role: 'admin'
}, secret)
console.log(token)

let result = jwt.decode(token, secret)
console.log(result)

const [header, content, sign] = token.split('.')
const fakeToken = [header, content, 'fakeSignature'].join('.')
console.log(fakeToken)
result = jwt.decode(fakeToken, secret)
console.log(result)
