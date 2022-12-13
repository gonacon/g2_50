/**
 * 포커스 관련 
 * @namespace Navigator
 * @see cs.createFocus
 * @example
 	var focus = cs.createFocus({
        id : 'newestMovie2SubView1',
        moveSelector : 'ul li',
        focusSelector : '',
        row : 1,
        col : 5,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 4
    });

    focus.getFocusedElementDataSet('assetid');
    focus.addFocus();
 */

(function(){

	/** 
	 * @memberof cs
	 * @function createFocus
	 * @param {object} info - focus를 관리 할 리스트의 정보
     * @property {string} info.id - 리스트의 div id
     * @property {string} info.moveSelector - 포커스 이동 DOM element (ex. ul li)
     * @property {string} info.focusSelector - [옵션] style이 적용될 element<br> info.moveSelector 이후 DOM element<br> info.moveSelector에 focus style 적용 시에는 공백 입력
     * @property {number} info.row - 리스트의 row 개수
     * @property {number} info.col - 리스트의 col 개수
     * @property {number} info.focusIdx - [옵션] 리스트의 포커스 되어야 할 인덱스 (default : 0)
     * @property {number} info.startIdx - [옵션] 리스트의 시작 인덱스 (default : 0)
     * @property {number} info.lastIdx - 리스트의 마지막 인덱스
     * @property {boolean} info.bRowRolling - Grid 리스트일 때 LEFT/RIGHT키로 행 이동할거면 true, 아니면 false(Grid 아니면 false로 설정해야함)
     * @returns {focusClass} focusClass instance 전달
	 */
	fm.createFocus = function(info){
		return new focusClass(info);
	};

	/**
	 * @class focusClass
	 * @param {object} info - focus를 관리 할 리스트의 정보
	 */
	function focusClass(info){
		this.id = info.id;
		this.moveSelector = info.moveSelector;
		this.focusSelector = info.focusSelector;
		this.focusedElement = undefined;
		this.listInfo = {
			row : Number(info.row),
			col : Number(info.col),
			curIdx : info.focusIdx ? Number(info.focusIdx) : 0,
			firstIdx : info.startIdx ? Number(info.startIdx) : 0,
			lastIdx : Number(info.lastIdx),
			bRowRolling : info.bRowRolling !== undefined ? info.bRowRolling : true
		};
		if(this.listInfo.row === 1) {
			//this.listType = 'H';
			this.listType = (this.listInfo.col === 1) ? 'G' : 'H';
		} else if(this.listInfo.col === 1) {
			this.listType = 'V';
		} else {
			this.listType = 'G';
		}
	};

	/** 
	 * @memberof focusClass
	 * @param {object} info - focus를 관리 할 리스트의 정보
	 * @desc focus를 관리 할 리스트 정보 변경
	 */
	focusClass.prototype.setListInfo = function(info){
		this.listInfo.row = (info.row !== undefined) ? info.row : this.listInfo.row;
		this.listInfo.col = (info.col  !== undefined) ? info.col : this.listInfo.col;
		this.listInfo.curIdx = (info.focusIdx  !== undefined) ? info.focusIdx : this.listInfo.curIdx;
		this.listInfo.firstIdx = (info.firstIdx  !== undefined) ? info.firstIdx : this.listInfo.firstIdx;
		this.listInfo.lastIdx = (info.lastIdx  !== undefined) ? info.lastIdx : this.listInfo.lastIdx;
	};

	/** 
	 * @memberof focusClass
	 * @param {object} el - focus할 DOM element
	 * @desc 전달하는 DOM element style에 'focusOn' 추가<br> 기존에 focus된 DOM element가 있을 경우 style에 'focusOn' 삭제 
	 */
	focusClass.prototype.setFocusedElement = function(el){
		if(this.focusedElement) {
			this.focusedElement.classList.remove('focusOn');
	    }
	    if(el) {
	    	this.focusedElement = el;
	    	el.classList.add('focusOn');
	    }else{
	    	console.log('>>>>> currentActiveView focusedElement is null.', 'system');
	    }
	};

	/** 
	 * @memberof focusClass
	 * @param {string} selector - style이 적용될 element <br> moveSelector 이후 DOM element만 전달
	 * @desc 전달하는 DOM element로 포커스 변경 시 style에 'focusOn' 추가 
	 */
	focusClass.prototype.changeFocusSelector = function(selector){
		if(selector){
			this.focusSelector = selector;
		}
	};

	/** 
	 * @memberof focusClass
	 * @desc 현재 focus된 DOM element가 있을 경우 style에 'focusOn' 삭제 
	 */
	focusClass.prototype.removeFocus = function(){
		if(this.focusedElement) {
			this.focusedElement.classList.remove('focusOn');
	    }
	};	

	/** 
	 * @memberof focusClass
	 * @desc listInfo 정보 중 focusIdx의 DOM element를 찾아 style에 'focusOn' 추가
	 */
	focusClass.prototype.addFocus = function(){
		if(this.focusSelector && this.focusSelector !== '') {
			this.focusedElement = document.querySelector('#'+this.id + ' ' + this.moveSelector).parentElement.children[this.listInfo.curIdx].querySelector(this.focusSelector);
		} else {
			/// if( this.listInfo.curIdx !== 0 ) this.listInfo.curIdx = 0;
			this.focusedElement = document.querySelector('#'+this.id + ' ' + this.moveSelector).parentElement.children[this.listInfo.curIdx];
		}
		this.focusedElement.classList.add('focusOn');
	};

	focusClass.prototype.getFocusElement = function(){
		return this.focusedElement;
	};

	/** 
	 * @memberof focusClass
	 * @param {number} index - 전달 받을 DOM element의 인덱스
	 * @returns {object} DOM element
	 * @desc 요청한 인덱스의 DOM element를 전달
	 */
	focusClass.prototype.getFocusElementByIndex = function(idx){
		var ele = undefined;
		if(this.focusSelector) {
			ele = document.querySelector('#'+this.id + ' ' + this.moveSelector).parentElement.children[idx].querySelector(this.focusSelector);
		} else {
			ele = document.querySelector('#'+this.id + ' ' + this.moveSelector).parentElement.children[idx];
		}

		if(!ele) {
			var curRow = Math.floor(this.listInfo.curIdx/this.listInfo.col);
			ele = document.querySelector('#'+this.id + ' ' + this.moveSelector).parentElement.parentElement.children[curRow].children[idx - (curRow * this.listInfo.col)];
		}

		return ele;
	};

	/** 
	 * @memberof focusClass
	 * @returns {number} index
	 * @desc 현재 focus되어 있는 DOM element의 인덱스
	 */
	focusClass.prototype.getFocusedIndex = function(){
		return this.listInfo.curIdx;
	};

	/** 
	 * @memberof focusClass
	 * @param {string} attribute - data-Attributes
	 * @returns {string} data
	 * @desc 현재 focus되어 있는 DOM element에 요청 받은 data-Attributes를 전달
	 */
	focusClass.prototype.getFocusedElementDataSet = function(attr){
		attr = attr.toLowerCase();
		var result = false;
		if(this.focusedElement) {
			result = this.focusedElement.dataset[attr];
		} 
		return result;	
	};

	/** 
	 * @memberof focusClass
	 * @param {number} index - 포커스 여부를 확인 할 DOM element의 인덱스
	 * @returns {boolean} result
	 * @desc 요청하는 Index의 DOM element에 포커스 여부를 전달
	 */
	focusClass.prototype.setFocusByIndex = function(idx){
		if(idx > this.listInfo.lastIdx && idx < 0) {
			return false;
		} else {
			this.listInfo.curIdx = idx;
			this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
			return true;
		}
	};

	/** 
	 * @memberof focusClass
	 * @param {string} direction - 이동 방향 : UP, DOWN, LEFT, RIGHT, PREV, NEXT
	 * @param {function} callback - 요청한 이동 방향으로 더 이상 이동이 불가 할 때 호출하는 callback 함수
	 * @desc 요청하는 이동 방향으로 focus를 이동. <br> 이동이 불가 한 경우 전달한 callback(direction, focusIndex) 함수 호출
	 */
	focusClass.prototype.moveFocus = function(direction, callback){
		direction = direction.toUpperCase();
		
		if(this.listType === 'V' && direction === 'UP') {
			direction = 'PREV';
		} else if(this.listType === 'V' && direction === 'DOWN') {
			direction = 'NEXT';
		}

		if(direction === 'UP') {
			if(this.listType === 'G') {
				if(this.listInfo.curIdx - this.listInfo.col < this.listInfo.firstIdx) {
					if(typeof callback === 'function') {
						callback({
							direction : 'UP',
							curIdx : this.listInfo.curIdx
						});
					}
				} else {
					this.listInfo.curIdx -= this.listInfo.col;
					this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
				}
			} else if(this.listType === 'H') { // Horizontal 리스트인 경우 UP/DOWN 시 callback 호출
				if(typeof callback === 'function') {
					callback({
						direction : 'UP',
						curIdx : this.listInfo.curIdx
					});
				}
			}
		} else if(direction === 'DOWN') {
			if(this.listType === 'G') {
				if(this.listInfo.curIdx + this.listInfo.col > this.listInfo.lastIdx) {
					if (Math.floor(this.listInfo.lastIdx/this.listInfo.col) === Math.floor(this.listInfo.curIdx/this.listInfo.col)) {
						if(typeof callback === 'function') {
							callback({
								direction : 'DOWN',
								curIdx : this.listInfo.curIdx
							});
						}
					} else {
						this.listInfo.curIdx = this.listInfo.lastIdx;
						this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
					}
				} else {
					this.listInfo.curIdx += this.listInfo.col;
					this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
				}
			} else if(this.listType === 'H') { // Horizontal 리스트인 경우 UP/DOWN 시 callback 호출
				if(typeof callback === 'function') {
					callback({
						direction : 'DOWN',
						curIdx : this.listInfo.curIdx
					});
				}
			}
		} else if((direction === 'LEFT' || direction === 'PREV') && this.listInfo.bRowRolling) {
			if(this.listInfo.curIdx === this.listInfo.firstIdx) {
				if(typeof callback === 'function') {
					callback({
						direction : direction,
						curIdx : this.listInfo.curIdx
					});
				}
			} else {
				this.listInfo.curIdx -= 1;
				this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
			}
		} else if((direction === 'RIGHT' || direction === 'NEXT') && this.listInfo.bRowRolling) {
			if(this.listInfo.curIdx === this.listInfo.lastIdx) {
				if(typeof callback === 'function') {
					callback({
						direction : direction,
						curIdx : this.listInfo.curIdx
					});
				}
			} else {
				this.listInfo.curIdx += 1;
				this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
			}
		} else if(direction === 'LEFT' || direction === 'PREV') {
			if(direction === 'LEFT' && this.listType === 'V') { // Vertical 리스트인 경우 LEFT/RIGHT 시 callback 호출
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else if ( this.listInfo.curIdx % this.listInfo.col === 0 && (this.listType === 'G' || this.listType === 'H')) {
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else if(this.listInfo.curIdx === this.listInfo.firstIdx) {
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else {
				this.listInfo.curIdx -= 1;
				this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
			}
		} else if(direction === 'RIGHT' || direction === 'NEXT') {
			if(direction === 'RIGHT' && this.listType === 'V') { // Vertical 리스트인 경우 LEFT/RIGHT 시 callback 호출
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else if ( (((this.listInfo.curIdx + 1) % this.listInfo.col === 0) || (this.listInfo.curIdx === this.listInfo.lastIdx)) && (this.listType === 'G' || this.listType === 'H')) {
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else if(this.listInfo.curIdx === this.listInfo.lastIdx) {
				if (typeof callback === 'function') {
					callback({
						direction: direction,
						curIdx: this.listInfo.curIdx
					});
				}
			} else {
				this.listInfo.curIdx += 1;
				this.setFocusedElement(this.getFocusElementByIndex(this.listInfo.curIdx));
			}
		}
	};
})();

export function fm() {
	return fm;
}