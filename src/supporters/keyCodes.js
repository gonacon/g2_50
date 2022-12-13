/**
 * Cloud Streaming KEY Mapping
 *
 * @namespace Keycode
 * @example
	    N1 : 49,
		N2 : 50,
		N3 : 51,
		N4 : 52,
		N5 : 53,
		N6 : 54,
		N7 : 55,
		N8 : 56,
		N9 : 57,
		N0 : 48,
		BACK_SPACE : 8, // CS 전용(back space키, 이전/취소)
		PRECH : null,
		VOL_UP : 103,
		VOL_DOWN : 97,
		MUTE : null,
		CH_UP : 105,
		CH_DOWN : 99,
		TOOLS : null,
		ENTER : 13,
		RETURN : 27,
		INFO : null,
		EXIT : null,
		UP : 38,
		DOWN : 40,
		LEFT : 37,
		RIGHT : 39,
		//CJHV
		RED : 112,
		GREEN : 113,
		YELLOW : 114,
		BLUE : 115,
		EXIT : 191

		var keyValue = cs.getKeyByValue(49);
		keyValue => N1
 * @see cs.getKeyByValue
 */
// var keyCodes = {
const keyCodes = {
  Keymap: {

    N1: 49,
    N2: 50,
    N3: 51,
    N4: 52,
    N5: 53,
    N6: 54,
    N7: 55,
    N8: 56,
    N9: 57,
    N0: 48,

    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,

    ENTER: 13,

    /*      BACK_SPACE : 902, 	//stb 전용(back space키, 이전/취소)*/
    EXIT: 81,			//나가기 KeyBoard Q

    //Color Key
    RED: 90,				//KeyBoard Z
    GREEN: 88,			//KeyBoard X
    YELLOW: 67,			//KeyBoard C
    BLUE: 86,			//KeyBoard V

    //Player Key
    RW: 188,
    FF: 190,

    //바로가기 키
    MENU: 87, 			//KeyBoard W
    MOVIE: 69,			//KeyBoard E
    CATCHUP: 82,			//KeyBoard R
    SEARCH: 84,			//KeyBoard T
    HOME: 89,			//KeyBoard Y
    ALLMENU: 77,			//KeyBoard M

    //특수키
    FAV: 70, 			//KeyBoard F
    STAR: 65,			//KeyBoard A
    SHARP: 83,			//KeyBoard S
    OPTION: 79,			//KeyBoard O
    STB_HOME: 905,			//NATIVE 연동 홈
    PC_BACK_SPACE: 8,
    BACK_SPACE: 902, 	//CS 전용(back space키, 이전/취소) Native 연동 back
    FAV_KEY: 906,
    RED_KEY: 924,
    GREEN_KEY: 922,
    YELLOW_KEY: 920,
    BLUE_KEY: 923,

    SEARCH_KEY: 903,
    NEXT_JUMP_KEY: 926,
    PRE_JUMP_KEY: 927,
    OPTION_KEY: 925,
    // STB_ALLMENU :904, //전체메뉴
    //STB_ALLSCHEDULE: 172,
    //STB_SEARCH: 903,
    SKIP_NEXT: 76,
    SKIP_PREV: 72
  },

  /**
   * 키코드 값에 따른 키 값을 리턴한다.
   * @memeberof cs
   */
  getKeyByValue: function (keyCode) {
    // getKeyByValue (keyCode) => {
    var arrays = this.Keymap;
    for (var k in arrays) {
      if (arrays[k] === keyCode) {
        return k;
      }
    }
  }
}

export default keyCodes;