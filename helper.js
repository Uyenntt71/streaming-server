const CryptoJS = require("crypto-js");

function decryptAES(cipherTxt, privateKey = "eNdtOeNDeNcRyPteDsCREt#2022") {
  let r = CryptoJS.enc.Hex.parse(
    CryptoJS.SHA1(privateKey).toString().substring(0, 32)
  );
  try {
    let result = CryptoJS.AES.decrypt(cipherTxt, r, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    if (!result) return null;
    return result;
  } catch (i) {
    return null;
  }
}

function encryptAES(t, e = "eNdtOeNDeNcRyPteDsCREt#2022") {
  var r = CryptoJS.enc.Hex.parse(CryptoJS.SHA1(e).toString().substring(0, 32));
  try {
    return "string" === typeof t
      ? CryptoJS.AES.encrypt(t.slice(), r, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString()
      : CryptoJS.AES.encrypt(JSON.stringify(t), r, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
  } catch (n) {
    return console.log("Encrypt error", t, n), "";
  }
}

module.exports = {
  encryptAES,
  decryptAES,
};
