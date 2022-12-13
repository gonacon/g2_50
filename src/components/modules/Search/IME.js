import appConfig from 'Config/app-config';

let IME = {
    IME_CHUNJIIN_MODE_1: 1,
    IME_CHUNJIIN_MODE_2: 2,
    IME_KEYCODE_0: 0,
    IME_KEYCODE_1: 1,
    IME_KEYCODE_2: 2,
    IME_KEYCODE_3: 3,
    IME_KEYCODE_4: 4,
    IME_KEYCODE_5: 5,
    IME_KEYCODE_6: 6,
    IME_KEYCODE_7: 7,
    IME_KEYCODE_8: 8,
    IME_KEYCODE_9: 9,
    IME_KEYCODE_DEL: 10,
    KEYBOARD_MODE_ENGLISH_LOWER: 2,
    KEYBOARD_MODE_ENGLISH_UPPER: 1,
    KEYBOARD_MODE_KOREAN: 0,
    KEYBOARD_MODE_NUMBER: 3,
    KEYBOARD_MODE_SYMBOL_1: 4,
    KEYBOARD_MODE_SYMBOL_2: 5,
    OK_KEY_DOWN: 0,
    OK_KEY_UP: 1,
    setSearchMode: function (mode) {return true}, 
    setKeyboardMode: function (mode) {return true},
    switchKeyboardMode: function (mode) {return true},
    sendKeyEvent: function (mode) {return true},
    setEnableSoftKeyboard: function (mode) {return true},
    setChunjiinMode: function (mode) {return true}
};

if (appConfig.runDevice) {
    IME = window.tvExt.utils.ime;
}

const IME_MODE = {
    HANGUL: 0,
    UPPERCASE: 1,
    LOWERCASE: 2,
    NUMBER: 3,
    SPECIAL1: 4,
    SPECIAL2: 5
};

export {
    IME_MODE,
    IME as default
};