(function(mod){
	window.Modable = mod();

})(function MODABLE_MODULE () {


	//==========================================================================
	//:::: UTILITIES AND POLYFILLS :::::::::::::::::::::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################

	// REQUEST ANIMATION FRAME POLYFILL
	var requestAnimationFrame = (window.requestAnimationFrame)
		? window.requestAnimationFrame
		: function requestAnimationFramePolyfill (f) { setTimeout(f, 0); };
	Modable.requestAnimationFrame = requestAnimationFrame;

	// ON DOCUMENT READY (POLYFILL)
	function onDocumentReady (callback) {
		if (document.documentMode) {
			if (document.readyState === 'complete') callback();
			else {
				document.addEventListener('readystatechange', function(){
					if (document.readyState === "complete") callback();
				});
			}
		} else {
			if (document.readyState !== 'loading') callback();
			else document.addEventListener('DOMContentLoaded', callback);
		}
	} Modable.onDocumentReady = onDocumentReady;

	// CUSTOM DOM EVENTS
	var CustomEvent = (!(document.documentMode || !window.CustomEvent))
		? window.CustomEvent
		: (function POLYFILL_CUSTOM_EVENT () {
			function CustomEvent (name, params) {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				var e = document.createEvent('CustomEvent');
				e.initCustomEvent(name, params.bubbles, params.cancelable, params.detail);
				return e;
			}
			CustomEvent.prototype = Object.create(Event.prototype);
			CustomEvent.prototype.constructor = CustomEvent;
			return CustomEvent;
		})();
	Modable.CustomEvent = CustomEvent;

	// Simple cross-platform attribute getter
	function attr (element, attribute) {
		return (element.hasAttribute(attribute))
			? element.getAttribute(attribute)
			: null;
	} Modable.attr = attr;

	// Easily add to an HTMLElement's [class] attribute
	function addClass (element, classy) {
		var c = attr(element, 'class');
		c = (c?c:'') + (c?' ':'') + classy;
		element.setAttribute('class', c);
		return c;
	} Modable.addClass = addClass;


	//==========================================================================
	//:::: INITIALIZE ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################
	 // Initializes coreStyle, the club, and custom events

	//////// CORE STYLE ////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	var coreStyle = Modable.coreStyle = document.createElement('style');
	coreStyle.setAttribute('data-modable-core-style', '');
	coreStyle.innerHTML = ''
		//////// CLUB ////////
		//////////////////////
		+ '.modable-club {'
		+     'position: relative;'
		+     'z-index: 7777;'
		+     'text-align: center;'
		+ '}'
		//////// BASE ////////
		//////////////////////
		+ '.modable-base {'
		+     'position:absolute; z-index:1;'
		+     'top:10%; left:10%; right:10%;'
		+ '}'
		+ '.modable-base[data-fade] {'
		+     'transition: opacity 400ms ease;'
		+     'opacity: 0;'
		+ '}'
		+ '.modable-base[data-fade="1"] {'
		+     'opacity: 1;'
		+ '}'
		//////// BLANKET ////////
		/////////////////////////
		+ '.modable-blanket {'
		+     'position:fixed; z-index:-1;'
		+     'top:0; right:0; bottom:0; left:0;'
		+     'background: rgba(0,0,0, 0.8);'
		+ '}'
	;

	onDocumentReady(function(){
		document.head.insertBefore(coreStyle, document.head.firstChild);
	});

	//////// CLUB //////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	var club = Modable.club = document.createElement('div');
	addClass(club, 'modable-club');
	
	onDocumentReady(function(){
		document.body.insertBefore(club, document.body.firstChild);
	})
	
	//////// MODABLE'S CUSTOM EVENTS ////////
	/////////////////////////////////////////

	var eventOptions = {
		modable_appear:      { bubbles: true, cancelable: true  }, // Appear animation begins (cancelable)
		modable_appeared:    { bubbles: true, cancelable: false }, // Appear animation completed
		modable_disappear:   { bubbles: true, cancelable: true  }, // Disappear animation begins (cancelable)
		modable_disappeared: { bubbles: true, cancelable: false }  // Disappear animation completed
	};

	Modable.events = {};

	for (var eventName in eventOptions) {
		var eo = eventOptions[eventName];
		var e = Modable.events[eventName] = new CustomEvent(eventName, eo);
		e.modable = null;
	}


	//==========================================================================
	//:::: CONSTRUCTOR :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################

	function Modable (options) {
		if (!(this instanceof Modable)) return new Modable(options); // Newless usage.
		var modable = this; // self-reference

		//////// OPTIONS ///////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		var frameSpacing = modable.frameSpacing
			= (options && options.frameSpacing!==undefined)
				? options.frameSpacing
				: 1/10;

		var classy
			= (options && options.classy)
				? options.classy
				: "";

		var escape = modable.escape
			= (options && options.escape!==undefined)
				? options.escape
				: true; // Defaults to true

		var animTime = modable.animTime
			= (options && options.animTime!==undefined)
				? options.animTime
				: 400;

		//////// MODABLE BASE //////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		 // Root element for each individual modable

		var base = modable.base = document.createElement("div");
		addClass(base, 'modable-base');
		addClass(base, classy);

		// DIRECT STYLES
		base.style.top   = (100 * frameSpacing) + "%";
		base.style.right = (100 * frameSpacing) + "%";
		base.style.left  = (100 * frameSpacing) + "%";

		// HTML ELEMENT INHERITS MODABLE PROTOTYPE METHODS
		Object.keys(Modable.prototype).forEach(function (key) {
			base[key] = Modable.prototype[key].bind(modable);
		});
		base.modable = modable;

		// ATTACHING TO DOM
		club.appendChild(base);

		//////// APPEARANCE ////////
		////////////////////////////

		if (modable.dispatch('modable_appear')) {
			base.setAttribute('data-fade', "0");
			base.style.transition = 'opacity '+modable.animTime+'ms ease';
			requestAnimationFrame(function(){
				requestAnimationFrame(function(){ // DOUBLE FOR FIREFOX!
					base.setAttribute('data-fade', "1");
					setTimeout(function(){
						modable.dispatch('modable_appeared');
					}, modable.animTime);
				});
			});
		}

		//////// MODABLE BLANKET ///////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		 // Dark overlay, generally blocks other page interaction

		var blanket = modable.blanket = document.createElement("div");
		blanket.setAttribute("class", "modable-blanket");
		base.appendChild(blanket);
		
		//////// FRAMING ADJUSTMENT ////////
		////////////////////////////////////

		function framingAdjustment () {
				// I need to figure out a way to account for natural document 
				// margin/padding that isn't zeroed (with `*{margin:0;padding:0;}`)
				//var bodyMarginTop = parseInt(window.getComputedStyle(document.body).marginTop.replace(/[^\d]/g, ''));
			// ONLY AFFECTS VERTICAL ADJUSTMENT
			var padding = window.innerHeight * frameSpacing;
			base.style.top = (window.pageYOffset + padding) + "px";
			base.style.height = (window.innerHeight - (padding*2)) + "px";
		}
		window.addEventListener('resize', framingAdjustment);
		base.addEventListener('modable_disappeared', function stopFramingAdjustment () {
			window.removeEventListener('resize', framingAdjustment);
		});
		framingAdjustment();

		//////// ESCAPER ///////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		function escaper (e) {
			if (modable.escape && e.keyCode === 27) {
				var base = club.querySelector('.modable-base:last-of-type');
				if (base) base.modable.close();
			}
		}
		document.addEventListener('keyup', escaper);
		base.addEventListener('modable_disappeared', function stopEscaper(){
			document.removeEventListener('keyup', escaper);
		});
	}


	//==========================================================================
	//:::: PROTOTYPE INSTANCE METHODS ::::::::::::::::::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################
	 // Modable HTMLElement inherits these prototype methods!

	Modable.prototype.dispatch = function dispatch (e, detail) {
		var modable = this;
		if (!(e instanceof CustomEvent)) e = Modable.events[e];
		e.modable = modable;
		e.detail = detail;
		return modable.base.dispatchEvent(e);
	};

	Modable.prototype.close = function close () { // Idempotent
		var modable = this;
		if (!modable.closing) {
			modable.closing = true;
			if (modable.dispatch('modable_disappear')) {
				modable.base.setAttribute('data-fade', "0");
				setTimeout(function(){
					modable.terminate();
				}, modable.animTime);
			}
		}
	};

	Modable.prototype.terminate = function terminate () {
		var modable = this;
		modable.dispatch('modable_disappeared');
		Modable.club.removeChild(modable.base);
	};


	//==========================================================================
	//:::: MODABLE IMAGE :::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################

	//////// CORE STYLE FOR IMAGE //////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	coreStyle.innerHTML += ''
		+ '.modable-image {'
		+     'width: auto;'
		+     'height: auto;'
		+     'max-width: 100%;'
		+     'max-height: 100%;'
		+     'border-radius: 4px;'
		+     'box-shadow: 1px 2px 6px rgba(0,0,0, 0.4);'
		+ '}';

	//////// MODABLE IMAGE CONSTRUCTOR /////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function ModableImage (options) {
		if (!(this instanceof ModableImage)) return new ModableImage(options); // Allowing newless usage.
		var modable = this;

		Modable.apply(modable, arguments); // ModableImage is a Modable
		
		//////// OPTIONS ////////
		/////////////////////////

		var src = (options && options.src)
			? options.src
			: "http://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/White_Tiger_in_Touroparc.jpg/1280px-White_Tiger_in_Touroparc.jpg";

		var alt = (options && options.alt)
			? options.alt
			: "";

		//////// ADDING TO SOME CLASS TO THE BASE ////////
		//////////////////////////////////////////////////

		addClass(modable.base, 'modable-image-base');
		
		//////// IMAGE ELEMENT ////////
		///////////////////////////////

		var image = modable.image = document.createElement("img");
		image.setAttribute("class", "modable-image");
		image.src = src;
		image.alt = alt;
		modable.base.appendChild(image);

		//////// CLICK TO CLOSE BLANKET ////////
		////////////////////////////////////////

		var closer = modable.close.bind(modable);
		modable.blanket.addEventListener('click', closer);
		image.addEventListener('click', closer);
		
	} Modable.Image = ModableImage;

	//////// MODABLE IMAGE INHERITANCE /////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	ModableImage.prototype = Object.create(Modable.prototype);
	ModableImage.prototype.constructor = Modable.Image;


	//==========================================================================
	//:::: DATA-MODABLE-IMAGE ATTRIBUTE AUTO-MODABLE :::::::::::::::::::::::::::
	//==========================================================================
	//##########################################################################

	// Recursively find the nearest node which has the given attribute
	function nearestElementWithAttr (element, attr) {
		if (!element || !(element instanceof HTMLElement)) return null;
		if (element.hasAttribute(attr)) return element;
		return nearestElementWithAttr(element.parentNode, attr);
	} Modable.nearestElementWithAttr = nearestElementWithAttr;

	// HANDLE MODAL-IMAGE CLICKS!
	onDocumentReady(function autoModableImages () {
		document.body.addEventListener("click", function(e){
			// Getting the nearest modable-image endowed element
			var element = nearestElementWithAttr(e.target, "modable-image");
			if (element === null) element = nearestElementWithAttr(e.target, "data-modable-image");

			if (element !== null) { // If a modable-image endowed element was found:
				// Getting the attribute
				var modableImageAttr = attr(element, "modable-image");
				if (modableImageAttr === null) modableImageAttr = attr(element, "data-modable-image");

				// Determining the image src
				var src;
				if (modableImageAttr) src = modableImageAttr;
				else {
					var tag = element.tagName.toLowerCase();
					if (tag === 'img') src = attr(element, "src");
					else if (tag === 'a') src = attr(element, "href")
				}

				// Creating the new modable
				new Modable.Image({ src: src });

				e.preventDefault(); // Preventing link behavior
				return false; // Preventing event bubbling
			}
		});
	});


	return Modable;
});