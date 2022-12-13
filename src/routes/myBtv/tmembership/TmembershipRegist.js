import React from 'react';
import PropTypes from 'prop-types';

import appConfig from 'Config/app-config';
import NumberInputV2 from 'Module/NumberInputV2';
import { EPS } from 'Network';
import { Core } from 'Supporters';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import PopupPageView from 'Supporters/PopupPageView';
import StbInterface from 'Supporters/stbInterface';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/tmembership/TmembershipRegist.css';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE, LEFT, RIGHT, UP, DOWN } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;

const CARD_DIGIT = 16;
const BIRTH_DIGIT = 8;
const OK = '0000';

const errorMessages = {
  invalid: [
    '입력하신 정보가 SKT 제휴 카드 정보와 일치하지 않습니다.',
    '멤버십 등급변경 등으로 기존 카드정보가 변경될 수 있으니 확인 후 다시 입력해 주세요.'
  ]
};

let focusOpts = {
  cardNumber: {
    id: 'cardNumber',
    moveSelector: '.contentBox .gridWrap .gridStyle',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 4,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 3,
  },
  genderSelect: {
    id: 'genderSelect',
    moveSelector: '.gender',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 2,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  },
  buttonGroup: {
    id: 'buttonGroup',
    moveSelector: '.buttonWrap',
    focusSelector: '.csFocus',
    row: 1,
    col: 2,
    focusIdx: 1,
    startIdx: 1,
    lastIdx: 1,
  },
  birth: {
    id: 'birth',
    type: 'ELEMENT',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 1,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 0,
  }
}

class TmembershipRegist extends PopupPageView {
  static defaultProps = {
    viewType: { pageTitle: '', subInfo: '', }
  }

  static propTypes = {
    viewType: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      contentSlides: [],
      pageTitle: this.props.viewType.pageTitle,
      subInfo: this.props.viewType.subInfo,
      genderSelect: ['select', ''],
      registButtonDisabled: true      //등록 완료 버튼 비활성화 여부
    };

    this.inputRefs = [];
    this.cardNo = ['', '', '', ''];
    this.birth = '';
    this.cardInputFocusIndex = 0;

    this.defaultFM = {
      cardNumber: new FM({
        ...focusOpts.cardNumber,
        onFocusChild: this.onFocusInput,
        onBlurContainer: this.onBlurInput,
        onFocusKeyDown: this.onInputCursor
      }),
      genderSelect: new FM({
        ...focusOpts.genderSelect,
        onFocusKeyDown: this.onRadioKeyDown
      }),
      buttonGroup: new FM({
        ...focusOpts.buttonGroup,
        onFocusKeyDown: this.onButtonGroupKeyDown
      }),
      birth: new FM({
        ...focusOpts.birth,
        onFocusChild: this.onBirthInputFocusOn,
        onBlurContainer: this.onBirthInputBlur,
        onFocusKeyDown: this.onBirthInputCursor
      })
    }

    const focusList = [
      { key: 'cardNumber', fm: null, link: { UP: null, DOWN: 'genderSelect' } },
      { key: 'genderSelect', fm: null, link: { LEFT: null, RIGHT: 'birth', UP: 'cardNumber', DOWN: 'buttonGroup' } },
      { key: 'birth', fm: null, link: { LEFT: 'genderSelect', RIGHT: null, UP: 'cardNumber', DOWN: 'buttonGroup' } },
      { key: 'buttonGroup', fm: null, link: { LEFT: null, RIGHT: null, UP: 'birth', DOWN: null } }
    ];

    this.declareFocusList(focusList);
  }

  onKeyDown(event) {
    super.onKeyDown(event);

    switch (event.keyCode) {
      case BACK:
        this.registCancel();
        return true;      // 이전 PageView의 back을 막음
      case UP:
      case DOWN:
        // UP/DOWN 키로 focus group 간에 움직일 때, input tag에 focus가 생기는 것을 방지
        event.preventDefault();
        break;
      case LEFT:
      case RIGHT:
        const key = this.getCurrentFocusInfo().key;

        // LEFT/RIGHT 키로 focus child 간에 움직일 때, input tag가 전체 선택 되는 것을 방지
        // 제대로 처리하지 않으면 input field 내 커서 이동 불가능
        if (key !== 'cardNumber' && key !== 'birth') {
          event.preventDefault();
        }
        break;
      default:
        break;
    }
  }

  registCancel = () => {
    this.props.callback();
  }

  injectRef = (ref, i) => {
    this.inputRefs[i] = ref;
  }

  checkValidCard = async (gender) => {
    return await EPS.request502({
      cardNo: this.cardNo.join(''),
      birthday: this.birth,
      genderCode: gender
    });
  }

  registerCard = async (gender) => {
    const res = await EPS.request510({
      cardNo: this.cardNo.join(''),
      birthday: this.birth,
      genderCode: gender
    });

    switch (res.result) {
      case OK: // 성공
        this.props.callback(res.result);
        Core.inst().showToast('T 멤버십 카드가 등록되었습니다.', '', 3000);
        //setTimeout(() => { this.props.callback(result); }, 3000);
        break;
      default:
        Core.inst().showToast(res.reason, '오류코드: ' + res.result, 3000);
        break;
    }
  }

  processRegister = async (gender) => {
    const resValidCard = await this.checkValidCard(gender);

    if (resValidCard && resValidCard.result === OK) {
      this.registerCard(gender);
    } else {
      Core.inst().showToast(...errorMessages.invalid, 3000);
    }
  }

  onButtonGroupKeyDown = (event, focusIdx) => {
    if (event.keyCode !== ENTER) return;

    if (focusIdx === 0) {
      let gender = 0;

      this.state.genderSelect.forEach((item, idx) => {
        if (item === 'select') {
          gender = idx + 1;
        }
      });

      this.processRegister(gender);
    } else if (focusIdx === 1) {
      this.props.callback();
      return true;
    }
  }

  onBirthInputBlur = () => {
    this.inputRefs.inputBirth.blur();
  }

  onBirthInputKeyDown = (event) => {
    this.birth = event.target.value;

    if (this.cardNo.join('').length === CARD_DIGIT && this.birth.length === BIRTH_DIGIT) {
      this.setState({ registButtonDisabled: false }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 0,
          focusIdx: 0
        });
      });
    } else if (!this.state.registButtonDisabled) {
      this.setState({ registButtonDisabled: true }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 1,
          focusIdx: 1
        });
      });
    }
  }

  onBirthInputFocusOn = (focusIdx) => {
    this.inputRefs.inputBirth.focus();
  }

  onRadioKeyDown = (event, focusIdx) => {
    if (event.keyCode === ENTER) {
      let newGenderSelect = [];
      if (focusIdx === 0) {			// 남성
        newGenderSelect = ['select', ''];
      } else if (focusIdx === 1) {	// 여성
        newGenderSelect = ['', 'select'];
      }

      this.setState({ genderSelect: newGenderSelect }, () => {
        this.setFocus(1, focusIdx)
      });
    }
  }

  onFocusInput = (idx) => {
    setTimeout(() => { this.inputRefs[idx].focus(); }, 10)
    this.cardInputFocusIndex = idx;
  }

  onBlurInput = () => {
    this.inputRefs[this.cardInputFocusIndex].blur();
  }

  onInputCursor = (event, idx) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs[idx];
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

  onBirthInputCursor = (event) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs.inputBirth;
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

  onFullCardNumber = (index) => {
    const indexToMove = index + 1;

    if (this.inputRefs[indexToMove]) {
      this.setFocus('cardNumber', indexToMove);
      this.inputRefs[indexToMove].focus();
    } else if (indexToMove === 4) {
      this.setFocus('genderSelect', 0);
      //this.genderSelect.focus();
    }
  }

  onInputKeyDown = (event, cpNo, type) => {
    this.cardNo[this.cardInputFocusIndex] = cpNo;

    if (this.cardNo.join('').length === CARD_DIGIT && this.birth.length === BIRTH_DIGIT) {
      this.setState({ registButtonDisabled: false }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 0,
          focusIdx: 0
        });
      });
    } else if (!this.state.registButtonDisabled) {
      this.setState({ registButtonDisabled: true }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 1,
          focusIdx: 1
        });
      });
    }
  }

  componentDidMount() {
    super.componentDidMount();

    const { cardNumber, genderSelect, buttonGroup, birth } = this.defaultFM;
    document.querySelector('.wrapper').classList.add('dark');
    this.setFm('cardNumber', cardNumber);
    this.setFm('genderSelect', genderSelect);
    this.setFm('buttonGroup', buttonGroup);
    this.setFm('birth', birth);
    this.setFocus(0);
    StbInterface.keyInfo({
			numKeyUse: false
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    document.querySelector('.wrapper').classList.remove('dark');
    if (appConfig.runDevice) window.tvExt.utils.ime.setSearchMode(false);
    StbInterface.keyInfo({
			numKeyUse: true
    });
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.setState({
        pageTitle: nextProps.viewType.pageTitle,
        subInfo: nextProps.viewType.subInfo,
      });
    }
  }

  render() {
    const { pageTitle, subInfo, genderSelect, registButtonDisabled } = this.state;
    const textInputTag = new Array(4).fill(0).map((item, idx) => {
      return (
        <NumberInputV2 key={idx}
          index={idx}
          onFull={this.onFullCardNumber}
          onInputKeyDown={this.onInputKeyDown}
          injectRef={this.injectRef}
          gridStyle="card"
          htmlFor="label"
        />
      );
    })

    return (
      <div className="wrap">
        <div className="registWrap tmembership">
          <h2 className="pageTitle">T 멤버십 할인카드 {pageTitle}</h2>
          <p className="subInfo">{subInfo} T 멤버십 카드번호 16자리와 회원정보를 입력해주세요.</p>
          <div className="registerForm" id="cardNumber">
            <div className="contentBox">
              <p className="inputTitle">카드번호</p>
              <div className="gridWrap contentGroup1">{textInputTag}</div>
            </div>
            <div className="contentBox addition contentGroup2">
              <div className="gridWrap" id="genderSelect">
                <div className="gender">
                  <p className="inputTitle">성별</p>
                  <div className="optionWrap">
                    <span className={`csFocusInput radioStyle ${genderSelect[0]}`}>남성</span>
                    <span className={`csFocusInput radioStyle ${genderSelect[1]}`}>여성</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="inputTitle">생년월일</p>
                <div className="gridWrap">
                  <NumberInputV2
                    id="birth"
                    index="inputBirth"
                    gridStyle="birth"
                    onInputKeyDown={this.onBirthInputKeyDown}
                    injectRef={this.injectRef}
                    placeholder="예)19921014"
                    maxLength={BIRTH_DIGIT}
                    htmlFor="label"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="fakeWrapper" id="buttonGroup">
            <div className="buttonWrap">
              <span className="csFocus btnStyle" data-disabled={registButtonDisabled}>
                <span className="wrapBtnText">등록완료</span>
              </span>
              <span className="csFocus btnStyle">
                <span className="wrapBtnText">취소</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TmembershipRegist;