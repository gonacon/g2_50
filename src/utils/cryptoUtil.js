import CryptoJS from "crypto-js";
import appConfig from "../config/app-config";
import dateFormat from 'dateformat';

let cryptoUtil = cryptoUtil || {};

(function () {
    var AES_KEY = 'smarttvkey';
    var AES_INITIAL_VECTOR = '1161266980123456';
    var AES_iv  = CryptoJS.enc.Utf8.parse(AES_INITIAL_VECTOR);

    var AES256_KEY = 'oEpnlw8nx3';
    var AES256_DIS_KEY = 'jEils4jeW9';

    cryptoUtil.encrypt_AES = function(inputData) {
        var suffixKey = new Date().format('yyMMdd');               //enc_date(요청날짜)
        var convertKey = CryptoJS.enc.Utf8.parse(AES_KEY + suffixKey);
        var encrypted = CryptoJS.AES.encrypt(inputData, convertKey, { iv: AES_iv, mode:CryptoJS.mode.ECB, padding:CryptoJS.pad.Pkcs7});
        var result = {
            'encrypted' :   encrypted.ciphertext.toString().toUpperCase(),
            'enc_date' : suffixKey
        };
        return result;
    };

    /**
     * @memberof cryptoUtil
     * @function encryptAESByKey
     * @params {string} inputKey, inputData
     * @returns {string} encrypted string
     * @desc 요청한 key와 data를 사용하여 AES 방식으로 암호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.encryptAESByKey = function(inputKey, inputData) {
        var convertKey, encrypted, txtEncrypted, key = inputKey;
        if (key.length > 16) {
            key = key.substring(0, 16);
        }
        convertKey = CryptoJS.enc.Utf8.parse(key);
        encrypted = CryptoJS.AES.encrypt(inputData, convertKey, { mode:CryptoJS.mode.ECB, padding:CryptoJS.pad.Pkcs7 });
        txtEncrypted = encrypted.ciphertext.toString().toUpperCase();

        return txtEncrypted;
    };

    /**
     * @memberof cryptoUtil
     * @function decryptedAESByKey
     * @params {string} inputKey, inputData
     * @returns {string} decrypted string
     * @desc 요청한 key와 암호화된data를 사용하여 AES 방식으로 복호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.decryptedAESByKey = function(inputKey, inputData) {
        var convertKey, decrypted, txtDecrypted, key = inputKey;
        if (key.length > 16) {
            key = key.substring(0, 16);
        }
        convertKey = CryptoJS.enc.Utf8.parse(key);
        decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(inputData) }, convertKey, { mode:CryptoJS.mode.ECB, padding:CryptoJS.pad.Pkcs7});
        txtDecrypted = decrypted.toString(CryptoJS.enc.Utf8);

        return txtDecrypted;
    };


    const EPS_INITIAL_VECTOR = "1161266980123456";
    /**
     * @memberof cryptoUtil
     * @function encryptAESByKeyEPS
     * @params {string} reqDate, inputData
     * @returns {string} encrypted string
     * @desc 요청한 key와 data를 사용하여 AES 방식으로 암호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.encryptAESByKeyEPS = (reqDate, inputData) => {
        let encrypted = CryptoJS.AES.encrypt(inputData, CryptoJS.enc.Utf8.parse('SK' + reqDate), 
        { iv: CryptoJS.enc.Utf8.parse(EPS_INITIAL_VECTOR), mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    };

    /**
     * @memberof cryptoUtil
     * @function decryptedAESByKeyEPS
     * @params {string} reqDate, inputData
     * @returns {string} decrypted string
     * @desc 요청한 key와 암호화된data를 사용하여 AES 방식으로 복호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.decryptedAESByKeyEPS = (reqDate, inputData) => {
        var convertKey, decrypted;
        convertKey = CryptoJS.enc.Utf8.parse('SK' + reqDate);
        decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(inputData) }, 
        convertKey, { iv: CryptoJS.enc.Utf8.parse(EPS_INITIAL_VECTOR), mode:CryptoJS.mode.CBC,
             padding:CryptoJS.pad.Pkcs7});
        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    /**
     * @memberof cryptoUtil
     * @function encryptAES256ByKey
     * @params {string} inputKey, inputData
     * @returns {string} encrypted string
     * @desc 요청한 key와 data를 사용하여 AES 방식으로 암호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.encryptAES256ByDIS = function(req_date, str) {
        // DIS KEY 를 사용
        let encrypted, key, iv;
        let stbId11, date;

        stbId11 = appConfig.STBInfo.stbId.substr(10, 12);
        req_date = req_date.replace("_", " ");
        date = new Date(req_date);
        key = AES256_DIS_KEY + stbId11 + dateFormat(date, "mmddHHMMss");
        iv  = CryptoJS.enc.Utf8.parse(key.substring(0, 16));

        encrypted = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), { iv: iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7 });

        return encrypted.ciphertext.toString();
    };
    cryptoUtil.encryptAES256ByKey = function(req_date, str) {
        let encrypted, key, iv;
        let stbId11, date;

        stbId11 = appConfig.STBInfo.stbId.substr(10, 12);
        req_date = req_date.replace("_", " ");
        date = new Date(req_date);
        key = AES256_KEY + stbId11 + dateFormat(date, "mmddHHMMss");
        iv  = CryptoJS.enc.Utf8.parse(key.substring(0, 16));

        encrypted = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), { iv: iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString();
    };

    /**
     * @memberof cryptoUtil
     * @function decryptedAES256ByKey
     * @params {string} inputKey, inputData
     * @returns {string} decrypted string
     * @desc 요청한 key와 암호화된data를 사용하여 AES 방식으로 복호화한 정보 전달. key가 16자가 넘으면 16자로 잘라 사용
     */
    cryptoUtil.decryptedAES256ByDIS = function(inputKey, req_date, str) {
        // DIS KEY 를 사용
        var decrypted, key, iv;
        let stbId11, date;
        
        stbId11 = appConfig.STBInfo.stbId.substr(10, 12);
        req_date = req_date.replace("_", " ");
        date = new Date(req_date);
        key = AES256_DIS_KEY + stbId11 + dateFormat(date, "mmddHHMMss");
        iv  = CryptoJS.enc.Utf8.parse(key.substring(0, 16));

        decrypted = CryptoJS.AES.decrypt({
            ciphertext: CryptoJS.enc.Hex.parse(str)
        }, CryptoJS.enc.Utf8.parse(key), { iv: iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7 });

        return decrypted.toString(CryptoJS.enc.Utf8);
    };
    cryptoUtil.decryptedAES256ByKey = function(req_date, str) {
        var decrypted, key, iv;
        let stbId11, date;
        
        stbId11 = appConfig.STBInfo.stbId.substr(10, 12);
        req_date = req_date.replace("_", " ");
        date = new Date(req_date);
        key = AES256_KEY + stbId11 + dateFormat(date, "mmddHHMMss");
        iv  = CryptoJS.enc.Utf8.parse(key.substring(0, 16));

        decrypted = CryptoJS.AES.decrypt({
            ciphertext: CryptoJS.enc.Hex.parse(str)
        }, CryptoJS.enc.Utf8.parse(key), { iv: iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.Pkcs7 });

        return decrypted.toString(CryptoJS.enc.Utf8);
    };
})();


export function cryptoUtil() {
    return cryptoUtil;
}