let SpatialTimer;

export function fnScrolling() {
	let scrollTopValue = [];

	for(let i=0; i < document.querySelectorAll('.contentGroup').length; i++){
		let eachVal = document.querySelectorAll('.contentGroup')[i];
		let wrapCon = document.querySelector('.wrap');
		scrollTopValue[i] = eachVal.offsetTop;
		
		eachVal.setAttribute('data-csFocus',i);
		//console.log(scrollTopValue);

		if((scrollTopValue[i] + eachVal.offsetHeight) <= 1080){
			scrollTopValue[i] = 0;
		}else if(wrapCon.offsetHeight - 1080 <= scrollTopValue[i]){
			scrollTopValue[i] = wrapCon.offsetHeight - 1080;
		}else{
			scrollTopValue[i] = scrollTopValue[i];
		}
		
		//시놉단편
		if(document.querySelectorAll('.synopShortContent').length && i === 1){
			scrollTopValue[i] = 1000;
		}
		
		//시놉시리즈
		if(document.querySelectorAll('.synopSeriesContent').length && i === 3){
			scrollTopValue[i] = 1080;
		}

		//커머스 상품보기
		if(document.querySelectorAll('.commerceProductWrap').length && i === 1){
			scrollTopValue[i] = 1080;
		}
	}

	for(let i=0; i < document.querySelectorAll('.contentGroup .csFocus, .csFocusCenter').length; i++){
		document.querySelectorAll('.contentGroup .csFocus, .csFocusCenter')[i].addEventListener('sn:focused',(event) => {
			clearTimeout(SpatialTimer);
			if(event.detail.direction === 'down' || event.detail.direction === 'up'){
				let targetScroll = event.target.closest('.contentGroup').getAttribute('data-csFocus');
				let targetDom = document.querySelector('.scrollWrap');

				targetDom.style.transform = 'translate(0,' + -(scrollTopValue[targetScroll]) + 'px)';
				document.querySelector('html').scrollTop = 0;
				document.querySelector('body').scrollTop = 0;
			}
		});
	}

	for(let i=0; i < document.querySelectorAll('.topMenu .csFocus').length; i++){
		document.querySelectorAll('.topMenu .csFocus')[i].addEventListener('sn:focused',() => {
			if(document.querySelectorAll('.menuNav').length){
				document.querySelector('.menuNav').classList.add('hide');
			}
		});
		
		document.querySelectorAll('.topMenu .csFocus')[i].addEventListener('sn:unfocused',() => {
			if(document.querySelectorAll('.menuNav').length){
				document.querySelector('.menuNav').classList.remove('hide');
			}
		});
	}
}

export function radioFn() {
	let radioEl = document.querySelectorAll('.optionWrap [class *= radioStyle]');
	for(let i = 0; i < radioEl.length; i++){
		radioEl[i].addEventListener('keydown',(event) => {
			if(event.keyCode === 13){
				event.preventDefault();
				radioEl[i].closest('.optionWrap').querySelector('[class *= radioStyle].select').classList.remove('select');
				radioEl[i].classList.add('select');
			}
		})
	}
}

export function checkFn() {
	let checkEl = document.querySelectorAll('[class *= checkStyle]');
	
	for(let i = 0; i < checkEl.length; i++){
		checkEl[i].addEventListener('keydown',(event) => {
			if(event.keyCode === 13){
				event.preventDefault();
				if(checkEl[i].getAttribute('select') === 'true'){
					checkEl[i].setAttribute('select','false');
				}else{
					checkEl[i].setAttribute('select','true');
				}
			}
		})
	}
}

export function popupScroll() {

	for(let i = 0 ; i < document.querySelectorAll('.innerContentInfo').length ; i++){

		let _target = document.querySelectorAll('.innerContentInfo')[i];

		let contentHeight = _target.scrollHeight;
		let scrollHeight = _target.clientHeight;
		let scrollContentHeight = _target.offsetHeight;

		if(scrollHeight < contentHeight){
			let scrollBarHeight = Math.ceil((scrollHeight / contentHeight) * scrollContentHeight);

			if(scrollBarHeight < 80){
				document.querySelectorAll('.scrollBar')[i].style.height = '80px';
				document.querySelectorAll('.scrollBar')[i].style.transform ='translate(0,-50%)';
			}else{
				document.querySelectorAll('.scrollBar')[i].style.height = scrollBarHeight  + 'px';
			}

			function scrolling(e){
				let scrollTopPosition = Math.ceil((_target.scrollTop / contentHeight) * scrollContentHeight);
				document.querySelectorAll('.scrollBar')[i].style.top = scrollTopPosition + 'px';
			}

			_target.addEventListener('keyup', (e) => { scrolling(e) });
			// document.querySelector('.innerContentInfo').addEventListener('keydown', (e) => { scrolling() });
		}else{
			document.querySelectorAll('.scrollBarBox')[i].remove();
		}
	}
}

export function getByteLength(str) {
	let codeByte = 0;
	for (let idx = 0; idx < str.length; idx++) {
		let oneChar = escape(str.charAt(idx));

		if      (oneChar.length === 1)          codeByte ++;
		else if (oneChar.indexOf("%u") !== -1)  codeByte += 2;
		else if (oneChar.indexOf("%") !== -1)   codeByte ++;
	}
	return codeByte;
}

export function selectFn(event) {
	let selectBtn = document.querySelectorAll('.selectBtn');
	for(let i = 0; i < selectBtn.length; i++){
		selectBtn[i].addEventListener('keydown',(event) => {
			event.preventDefault();
			let wrapper = selectBtn[i].closest('.selectWrap');
			if(event.keyCode === 13) {
				wrapper.classList.add('active');
				if (wrapper.querySelector('.select')) {
					wrapper.querySelector('.select').focus();
				} else {
					wrapper.querySelector('.selectList li:first-child .radioStyle').focus();
				}
			}

		})
	}
	let selectList = document.querySelectorAll('.selectList .radioStyle');
	for(let i = 0; i < selectList.length; i++){
		selectList[i].addEventListener('keydown',(event) => {
			event.preventDefault();
			let activeText = selectList[i].innerHTML;
			let list = selectList[i].closest('.selectWrap').querySelectorAll('.radioStyle');
			if(event.keyCode === 13) {
				document.querySelector('.selectBtn').innerHTML = activeText;
				for(let i=0; i < list.length; i++) {
					list[i].classList.remove('select');
				}
				selectList[i].classList.add('select');

				selectList[i].closest('.selectWrap').classList.remove('active');
				selectList[i].closest('.selectWrap').querySelector('.selectBtn').focus()
			}
		})
	}
}

export function phoneNumFn(value){
	let regExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;

	if( !regExp.test(value) ){
		return false;
	} else {
		return true;
	}
}

export function createMarkup(str) {
	return {__html: str};
}

export function scrollUp(event) {
	let scrollUp = document.querySelector('.btnTop');
	scrollUp.addEventListener('keydown', (event) => {
		if(event.keyCode === 13) {
			event.preventDefault();
			document.querySelector('.scrollWrap').style.transform = "translate(0,0)";
			document.querySelector('.loadFocus').focus();
		}
	})
}

export function focusClass(){
	for(let i=0; i < document.querySelectorAll('.csFocus, .csFocusMenu, .orgFocus, .csFocusPop, .radioStyle, .csFocusCenter').length; i++){
		document.querySelectorAll('.csFocus, .csFocusMenu, .orgFocus, .csFocusPop, .radioStyle, .csFocusCenter')[i].addEventListener('focus',(event) => {
			if(document.querySelectorAll('.focusOn').length){
				document.querySelector('.focusOn').classList.remove('focusOn');
			}
			setTimeout(function(){
				document.activeElement.classList.add('focusOn');
			},0);
		});
	}
}

export function lastBlockFocus() {
	if(document.querySelector('.btnTopWrap .btnTop') !== null) {
		let con;
		if(document.querySelector('.genreMenuListWrap') !== null) {
			con = document.querySelectorAll('.GenreListWrapper .contentGroup');
		}else {
			con = document.querySelectorAll('.scrollWrap > .contentGroup:not(.searchContent)');
		}
		let lastCon = document.querySelectorAll('.contentGroup')[con.length-1];
		let el = lastCon.querySelectorAll('.slide .csFocus');
		for(let i = 0; i < el.length ; i++) {
			el[i].addEventListener('keydown',function(event) {
				if(event.keyCode === 40) {
					document.querySelector('.btnTopWrap .btnTop').focus();
				}
			})
		}

	}
}