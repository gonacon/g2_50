// const log = function() { console.error(...arguments); }
const log = function () { }

class FM {
  constructor(option) {
    const {
      id,
      moveSelector,
      focusSelector,
      containerSelector,
      layoutSelector,
      row,
      col,
      focusIdx,
      page, // 다음 포커스시 가까운 아이템을 구하기 위해 추가.
      maxItem, // 한화면에 보여질 아이템 갯수(예: 3장짜리 슬라이더, 6장짜리 슬라이더...)
      startIdx,
      lastIdx,
      bRowRolling,
      anchor,
      type,
      onFocusChild,
      onFocusContainer,
      onBlurContainer,
      onFocusKeyDown
    } = option;

    this.type = type ? type : 'LIST';
    this.id = id;
    this.moveSelector = moveSelector;
    this.focusSelector = focusSelector ? focusSelector : '.csFocus';
    this.containerSelector = containerSelector;
    this.layoutSelector = layoutSelector;
    this.listInfo = {
      row: Number(row),
      col: Number(col),
      curIdx: focusIdx ? Number(focusIdx) : 0,
      firstIdx: startIdx ? Number(startIdx) : 0,
      lastIdx: Number(lastIdx),
      page: Number(page), // 가까운 아이템으로 이동을 위해 필요.
      maxItem: Number(maxItem),
      bRowRolling
    };
    this.anchor = anchor;
    this.onFocusChild = onFocusChild;
    this.onFocusContainer = onFocusContainer;
    this.onBlurContainer = onBlurContainer;
    this.onFocusKeyDown = onFocusKeyDown;

    this.getContainerRect = this.getContainerRect.bind(this);

    this.focusedElement = undefined;
    if (row === 1) {
      this.listType = col === 1 ? 'G' : 'H';
    } else if (col === 1) {
      this.listType = 'V';
    } else {
      this.listType = 'G';
    }
  }

  setListInfo({ row, col, curIdx, firstIdx, lastIdx, focusIdx, page }) {
    this.listInfo.page = (page !== undefined)? page : this.listInfo.page;
    this.listInfo.row = (row !== undefined) ? row : this.listInfo.row;
    this.listInfo.col = (col !== undefined) ? col : this.listInfo.col;
    this.listInfo.curIdx = (focusIdx !== undefined) ? focusIdx : this.listInfo.curIdx;
    this.listInfo.firstIdx = (firstIdx !== undefined) ? firstIdx : this.listInfo.firstIdx;
    this.listInfo.lastIdx = (lastIdx !== undefined) ? lastIdx : this.listInfo.lastIdx;
    this.listInfo.curIdx = (curIdx !== undefined)? curIdx: this.listInfo.curIdx;
  }

  setFocusedElement(el) {
    if (this.focusedElement) {
      this.focusedElement.classList.remove('focusOn');
    }
    if (el) {
      this.focusedElement = el;
      if (this.focusedElement) {
        el.classList.add('focusOn');
      }
      // TODO: 몇번째 자식인지 체크해서 onFocusChild 실행해줘야됨
      // 내부적으로만 쓰이는거면 해줄 필요 없다 : this.listInfo.curIdx 세팅이후 => this.stFocusedElement(idx) 하기때문
    } else {
      console.log('>>>>> currentActiveView focusedElement is null.', 'system');
    }
  }

  removeFocus(direction) {
    log('navi.removeFocus', this.id);
    if (this.focusedElement) {
      this.focusedElement.classList.remove('focusOn');
    }
    if (typeof this.onBlurContainer === 'function') {
      this.onBlurContainer(direction);
    }
  }

  getContainerRect() {
    let query = null;
    let element = null;
    if (this.type === 'ELEMENT') {
      query = `#${this.id}${this.focusSelector}`;
      const query2 = `#${this.id} ${this.focusSelector}`;

      element = document.querySelector(query);
      if (!element) {
        element = document.querySelector(query2);
      }
    } else {
      query = `#${this.id}`;
      element = document.querySelector(query);
      // if (this.layoutSelector) {
      // 	query = `#${this.id} ${this.layoutSelect}`;
      // 	query = `#${this.id}${this.layoutSelect}`;
      // 	element = document.querySelector(query);
      // 	if (!query) {
      // 		element = document.querySelector(query);
      // 	}
      // } else {
      // 	if (this.containerSelector) {
      // 		query = `#${this.id} ${this.containerSelector}`;
      // 		element = document.querySelector(query); 
      // 	} else {
      // 		query = `#${this.id} ${this.moveSelector}`;
      // 		element = document.querySelector(query);
      // 	}
      // }
    }
    return element ? element.getBoundingClientRect() : null;
  }

  addFocus(direction) {
    log('navi.addFocus', this.id);
    if (typeof this.onFocusContainer === 'function') {
      this.onFocusContainer(direction);
    }
    switch (this.type) {
      case 'FAKE':
        console.error('fake.focus', this.listInfo.curIdx, this.listInfo.page);
        if (this.onFocusChild) {
          this.onFocusChild(this.listInfo.curIdx, this.listInfo.page)
        }
        break;
      case 'BLOCK':
      case 'LIST':
        if (this.containerSelector) {
          let container = document.querySelector(`#${this.id} ${this.containerSelector}`);
          log(`#${this.id} ${this.containerSelector}`);
          if (!container) {
            container = document.querySelector(`#${this.id}${this.containerSelector}`)
            log(`#${this.id}${this.containerSelector}`);
          }
          log('container', container);
          if (container) {
            const elements = container.querySelectorAll(`${this.focusSelector}`)
            this.focusedElement = elements[this.listInfo.curIdx];
          }
        } else if (this.focusSelector && this.focusSelector !== '') {
          const query = `#${this.id} ${this.moveSelector}`;
          const list = document.querySelector(query);
          if (!list) {
            log('FM 에 지정된 컨테이너 엘리먼트를 찾을 수 없음:', query);
            return;
          }
          const parent = list.parentElement;
          let element = null;
          if (!parent.children[this.listInfo.curIdx]) {
            element = parent.children[0].querySelectorAll(this.focusSelector)[this.listInfo.curIdx];
          }
          if (!element) {
            element = parent.children[this.listInfo.curIdx].querySelector(this.focusSelector);
          }

          this.focusedElement = element;
          if (!this.focusedElement) {
            log('FM  에 지정된 컨테이너 엘리먼트는 찾았으나 포커스 엘리먼트를 찾을 수 없음:', this.focusSelector);
            return;
          }
        } else {
          const query = `#${this.id} ${this.moveSelector}`;
          const list = document.querySelector(query);
          if (!list) {
            log('FM 에 지정된 컨테이너 엘리먼트를 찾을 수 없음:', query);
            return;
          }
          const parent = list.parentElement;
          this.focusedElement = parent.children[this.listInfo.curIdx];
          if (!this.focusedElement) {
            log(`FM 에 지정된 컨테이너 엘리먼트의 ${this.listInfo.curIdx}번째 자식 엘리먼트를 찾을 수 없음`);
            return;
          }
        }
        if (this.focusedElement) {
          this.focusedElement.classList.add('focusOn');
        }

        break;
      case 'ELEMENT':
        if (this.focusSelector && this.focusSelector !== '') {
          const query = `#${this.id}${this.focusSelector}`;
          const query2 = `#${this.id} ${this.focusSelector}`;
          this.focusedElement = document.querySelector(query);
          if (!this.focusedElement) {
            this.focusedElement = document.querySelector(query2);
          }
          if (!this.focusedElement) {
            log(`FM 에 지정된 포커스 엘리먼트를 찾을 수 없음\n${query}\n${query2}`);
            return;
          }
        }
        if (this.focusedElement) {
          this.focusedElement.classList.add('focusOn');
        }
        break;
      default:
        break;
    }

    if (typeof this.onFocusChild === 'function') {
      this.onFocusChild(this.listInfo.curIdx);
    }
  }

  setFocusByIndex(idx) {
    log('navi.setFocusByIndex', this.id, idx);
    if (this.type === 'FAKE') {
      this.listInfo.curIdx = idx;
      if (typeof this.onFocusChild === 'function') {
        this.onFocusChild(idx);
      }
      if (typeof this.onFocusContainer === 'function') {
        this.onFocusContainer();
      }
      return true;
    }

    if (idx > this.listInfo.lastIdx && idx < 0) {
      return false;
    } else {
      this.listInfo.curIdx = idx;
      const focusedElement = this.getFocusElementByIndex(this.listInfo.curIdx);
      // console.error('fucosedElement', focusedElement);
      this.setFocusedElement(focusedElement);
      if (typeof this.onFocusChild === 'function') {
        this.onFocusChild(idx);
      }
      if (typeof this.onFocusContainer === 'function') {
        this.onFocusContainer();
      }
      return true;
    }
  }

  setFocusByIndexOnPage(idxOnPage, page, direction) {
    log('navi.setFocusByIndexOnPage', idxOnPage);
    if (this.type === 'FAKE') {
      let idx = this.listInfo.page + idxOnPage;
      if (idx > this.listInfo.lastIdx) {
        idx = this.listInfo.lastIdx;
      }
      this.listInfo.curIdx = idx;
      if (typeof this.onFocusChild === 'function') {
        // this.onFocusChild(this.listInfo.page + idxOnPage, this.listInfo.page);
        this.onFocusChild(idx, this.listInfo.page);
      }
      if (typeof this.onFocusContainer === 'function') {
        this.onFocusContainer();
      }
      return true;
    }

    let idx = this.listInfo.page + idxOnPage;
    if (idx > this.listInfo.lastIdx) {
      idx = this.listInfo.lastIdx;
    }

    if (idx > this.listInfo.lastIdx && idx < 0) {
      return false;
    } else {
      // 기존 포커스를 제거해야됨.
      this.removeFocus();

      this.listInfo.curIdx = idx;
      const focusedElement = this.getFocusElementByIndex(this.listInfo.curIdx);
      
      this.setFocusedElement(focusedElement);
      if (typeof this.onFocusChild === 'function') {
        this.onFocusChild(idx, true); // don't slide flag 추가
      }
      if (typeof this.onFocusContainer === 'function') {
        this.onFocusContainer(direction);
      }
      return true;
    }
  }

  getFocusElement() {
    return this.focusedElement;
  }

  getFocusElementByIndex(idx) {
    if (this.type === 'FAKE') {
      return null;
    }
    var ele = undefined;
    if (this.focusSelector) {
      const query = `#${this.id} ${this.moveSelector}`;
      const moveElement = document.querySelector(query);

      if (this.containerSelector) {
        let container = document.querySelector(`#${this.id} ${this.containerSelector}`);
        if (!container) {
          container = document.querySelector(`#${this.id}${this.containerSelector}`);
          if (!container) {   // 화면에 그릴 데이터가 없을 때 오류 발생하여 예외처리.
            return;
          }
        }
        const elements = container.querySelectorAll(`${this.focusSelector}`);
        return elements[this.listInfo.curIdx];
      }

      if (!moveElement)
        return;

      if (!document.querySelector('#' + this.id + ' ' + this.moveSelector).parentElement.children[idx]) {
        ele = document.querySelector(`#${this.id} ${this.moveSelector} ${this.focusSelector}:nth-child(${idx + 1})`)
      } else {
        ele = document.querySelector('#' + this.id + ' ' + this.moveSelector).parentElement.children[idx].querySelector(this.focusSelector);
      }
    } else {
      ele = document.querySelector('#' + this.id + ' ' + this.moveSelector).parentElement.children[idx];
    }

    if (!ele) {
      var curRow = Math.floor(this.listInfo.curIdx / this.listInfo.col);
      ele = document.querySelector('#' + this.id + ' ' + this.moveSelector).parentElement.parentElement.children[curRow].children[idx - (curRow * this.listInfo.col)];
    }
    return ele;
  }

  getFocusedIndex() {
    return this.listInfo.curIdx;
  }

  getFocusedElementDataSet(attr) {
    attr = attr.toLowerCase();
    var result = false;
    if (this.focusedElement) {
      result = this.focusedElement.dataset[attr];
    }
    return result;
  }

  handleKeyDown(event) {
    if (typeof this.onFocusKeyDown === 'function') {
      return this.onFocusKeyDown(event, this.listInfo.curIdx);
    }
  }

  moveFocus(direction, callback, prevFocusInfo) {
    const { curIdx, firstIdx, lastIdx, bRowRolling, col } = this.listInfo;
    // log(`navi.moveFocus[${this.id}] curIdx:${curIdx}, lastIdx:${lastIdx}`);
    direction = direction.toUpperCase();
    let dir = direction;

    if (this.type === 'ELEMENT' || this.type === 'FAKE') {
      callback({
        id: this.id,
        type: 'E',
        direction,
        curIdx: this.listInfo.curIdx
      });
      return;
    }

    // 세로 리스트 와 가로 리스트는 이전 / 다음 의 개념으로 같이 처리할 수 있기때문에
    // 상황별로 방향을 PREV / NEXT 로 맵핑해서 공통으로 처리
    if ((this.listType === 'H' && direction === 'LEFT')
      || (this.listType === 'V' && direction === 'UP')) {
      dir = 'PREV';
    } else if ((this.listType === 'H' && direction === 'RIGHT')
      || (this.listType === 'V' && direction === 'DOWN')) {
      dir = 'NEXT';
    }

    switch (this.listType) {
      case 'H':
      case 'V':
        if (dir === 'PREV') {
          if (curIdx === firstIdx) {
            if (bRowRolling) {
              this.listInfo.curIdx = lastIdx;
            } else if (typeof callback === 'function') {
              // 이동불가능하면 callback 호출후 바로 리턴
              // 이하 모든 이동 불가능 한 경우는 callback 호출은
              callback({
                id: this.id,
                type: this.listType,
                direction: direction,
                curIdx: this.listInfo.curIdx
              });
              return;
            }
          } else {
            this.listInfo.curIdx -= 1;
          }
        } else if (dir === 'NEXT') {
          if (curIdx === lastIdx) {
            if (bRowRolling) {
              this.listInfo.curIdx = firstIdx;
            } else if (typeof callback === 'function') {
              callback({
                id: this.id,
                type: this.listType,
                direction: direction,
                curIdx: this.listInfo.curIdx
              });
              return;
            }
          } else {
            this.listInfo.curIdx += 1;
          }
        } else {
          if (typeof callback === 'function') {
            callback({
              id: this.id,
              type: this.listType,
              direction: direction,
              curIdx: this.listInfo.curIdx
            });
            return;
          }
        }
        break;
      case 'G':
        if (dir === 'LEFT') {
          if (curIdx === firstIdx) {
            callback({
              id: this.id,
              type: this.listType,
              direction: direction,
              curIdx: this.listInfo.curIdx
            });
            return;
          } else {
            this.listInfo.curIdx -= 1;
          }
        } else if (dir === 'RIGHT') {
          if (curIdx === lastIdx) {
            callback({
              id: this.id,
              type: this.listType,
              direction: direction,
              curIdx: this.listInfo.curIdx
            });
            return;
          } else {
            this.listInfo.curIdx += 1;
          }
        } else if (dir === 'UP') {
          if (curIdx - col < firstIdx) { // 최상단이면 callback 호출
            callback({
              id: this.id,
              type: this.listType,
              direction: direction,
              curIdx: this.listInfo.curIdx
            });
            return;
          } else {
            this.listInfo.curIdx -= col; // 최상단이 아니면 1열 UP
          }
        } else if (dir === 'DOWN') {
          if (curIdx + col > lastIdx) {
            if (Math.floor(lastIdx / col) === Math.floor(curIdx / col)) { // 최하단이면 callback 호출
              callback({
                id: this.id,
                type: this.listType,
                direction: direction,
                curIdx: this.listInfo.curIdx
              });
              return;
            } else { // 최하단이 아니면 마지막 리스트로 포커스 이동
              this.listInfo.curIdx = lastIdx;
            }
          } else {
            this.listInfo.curIdx += col; // 1열 DOWN
          }
        }
        break;
      default: break;
    }

    const focusedElement = this.getFocusElementByIndex(this.listInfo.curIdx);
    this.setFocusedElement(focusedElement);
    if (typeof this.onFocusChild === 'function') {
      this.onFocusChild(this.listInfo.curIdx);
    }
  }
}

export default FM;