
function initLayout(kb) {

	var blacksDiv;
	var numBlacks = kb.blacks.length;

	kb.innerHTML = '';
	kb.classList.add('keyboard');
	
	blacksDiv = document.createElement('div');
	kb.appendChild(blacksDiv);
	blacksDiv.className = 'blacks';

	for(var i = 0; i < kb.numOctaves; i++) {

		for(var j = 0; j < numBlacks; j++) {

			var isBlack = kb.blacks[j],
				keyDiv = document.createElement( 'div' ),
				index = j + numBlacks * i,
				label = kb.keyboardLayout[ index ];

			keyDiv.className = isBlack ? kb.keyBlackClass : kb.keyClass;
			keyDiv.innerHTML = label;
			keyDiv.dataset.index = index;

			keyDiv.addEventListener('mousedown', makeCallback(kb, onDivMouseDown), false);
			keyDiv.addEventListener('mouseup', makeCallback(kb, onDivMouseUp), false);

			kb.keys.push( keyDiv );

			if(isBlack) {
				blacksDiv.appendChild( keyDiv );

				if(j >= 2 && !kb.blacks[j - 1] && !kb.blacks[j - 2] || (j === 1 && i > 0) ) {
					keyDiv.classList.add('prevwhite');
				}
			} else {
				kb.appendChild( keyDiv );
			}

		}
	}

	kb.tabIndex = 1; // TODO what if there's more than one keyboard?
	kb.addEventListener('keydown', makeCallback(kb, onKeyDown), false);
	kb.addEventListener('keyup', makeCallback(kb, onKeyUp), false);

}


function makeCallback(kb, fn) {

	var cb = function(e) {
		fn(kb, e);
	};

	return cb;

}


function onDivMouseDown( keyboard, ev ) {

	if( keyboard.keyPressed ) {
		return;
	}

	var key = ev.target;

	dispatchNoteOn( keyboard, key.dataset.index );

}


function onDivMouseUp( keyboard, ev ) {

	if( keyboard.keyPressed ) {
		dispatchNoteOff( keyboard );
	}

}


function onKeyDown( keyboard, e ) {

	var index = findKeyIndex( keyboard, e );

	if( keyboard.keyPressed ) {
		return;
	}

	if( index === -1 || e.altKey || e.altGraphKey || e.ctrlKey || e.metaKey || e.shiftKey ) {
		// no further processing
		return;
	}

	dispatchNoteOn( keyboard, index );

}


function onKeyUp( keyboard, e ) {

	// Only fire key up if the key is in the defined layout
	if( findKeyIndex( keyboard, e ) !== -1 ) {
		dispatchNoteOff( keyboard );
	}

}


function findKeyIndex( keyboard, e ) {

	var keyCode = e.keyCode || e.which,
		keyChar = String.fromCharCode( keyCode ),
		index = keyboard.keyboardLayout.indexOf( keyChar );

	return index;

}


function dispatchNoteOn( keyboard, index ) {

	keyboard.keyPressed = true;

	var key = keyboard.keys[index],
		currentClass = key.className;

	key.classList.add('active');

	var evt = document.createEvent('CustomEvent');
	evt.initCustomEvent('noteon', false, false, { index: index });
	keyboard.dispatchEvent(evt);

}


function dispatchNoteOff( keyboard ) {

	var activeKey = keyboard.querySelector( '.active' );

	if( activeKey ) {
		activeKey.classList.remove('active');
	}

	keyboard.keyPressed = false;

	var evt = document.createEvent('CustomEvent');
	evt.initCustomEvent('noteoff', false, false, null);
	keyboard.dispatchEvent(evt);
	
}



function register() {

	xtag.register('audio-keyboard', {
		lifecycle: {
			created: function() {
				
				this.keyClass = 'key';
				this.keyBlackClass = 'key black';
				this.keyboardLayout = 'ZSXDCVGBHNJMQ2W3ER5T6Y7U'.split('');
				// TODO rename this variable to something more descriptive-it's confusing
				this.blacks = [ false, true, false, true, false, false, true, false, true, false, true, false ];

				this.rebuildKeyboard();

			},
		},
		methods: {
			rebuildKeyboard: function() {
				this.keys = [];
				this.numOctaves = this.getAttribute('octaves');
				initLayout(this);
			}
		},
		accessors: {
			octaves: {
				attribute: {},
				set: function(value) {
					var cappedValue = value !== null ? Math.min(2, parseInt(value, 10)) : 1;
					this.setAttribute('octaves', cappedValue);
					this.rebuildKeyboard();
				}
			}
		}
	});

}

module.exports = {
	register: register
};
