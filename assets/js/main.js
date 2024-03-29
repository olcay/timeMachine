/*
	Time Machine by Olcay Bayram
	otomatikmuhendis.com | @otomatikmuhendis
*/

(function () {

	"use strict";

	var $body = document.querySelector('body');

	// Methods/polyfills.

	// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
	!function () { function t(t) { this.el = t; for (var n = t.className.replace(/^\s+|\s+$/g, "").split(/\s+/), i = 0; i < n.length; i++)e.call(this, n[i]) } function n(t, n, i) { Object.defineProperty ? Object.defineProperty(t, n, { get: i }) : t.__defineGetter__(n, i) } if (!("undefined" == typeof window.Element || "classList" in document.documentElement)) { var i = Array.prototype, e = i.push, s = i.splice, o = i.join; t.prototype = { add: function (t) { this.contains(t) || (e.call(this, t), this.el.className = this.toString()) }, contains: function (t) { return -1 != this.el.className.indexOf(t) }, item: function (t) { return this[t] || null }, remove: function (t) { if (this.contains(t)) { for (var n = 0; n < this.length && this[n] != t; n++); s.call(this, n, 1), this.el.className = this.toString() } }, toString: function () { return o.call(this, " ") }, toggle: function (t) { return this.contains(t) ? this.remove(t) : this.add(t), this.contains(t) } }, window.DOMTokenList = t, n(Element.prototype, "classList", function () { return new t(this) }) } }();

	// canUse
	window.canUse = function (p) { if (!window._canUse) window._canUse = document.createElement("div"); var e = window._canUse.style, up = p.charAt(0).toUpperCase() + p.slice(1); return p in e || "Moz" + up in e || "Webkit" + up in e || "O" + up in e || "ms" + up in e };

	// window.addEventListener
	(function () { if ("addEventListener" in window) return; window.addEventListener = function (type, f) { window.attachEvent("on" + type, f) } })();

	// Play initial animations on page load.
	window.addEventListener('load', function () {
		window.setTimeout(function () {
			$body.classList.remove('is-preload');
		}, 100);
	});

	// Slideshow Background.
	var BackgroundManager = function () {
		// Settings.
		var settings = {
			// Images (in the format of 'url': 'alignment').
			images: {
				'images/bg03.jpg': 'center',
				'images/bg02.jpg': 'center',
				'images/bg01.jpg': 'center'
			},

			// Delay.
			delay: 6000
		};

		var isAtDefault = true;

		var init = function () {
			// Vars.
			var pos = 0, lastPos = 0,
				$wrapper, $bgs = [], $bg,
				k, v;

			var $wrapper = document.querySelector('#bg');

			if ($wrapper) {
				$wrapper.innerHTML = '';
			} else {
				// Create BG wrapper, BGs.
				$wrapper = document.createElement('div');
				$wrapper.id = 'bg';
				$body.appendChild($wrapper);
			}

			for (k in settings.images) {

				// Create BG.
				$bg = document.createElement('div');
				$bg.style.backgroundImage = 'url("' + k + '")';
				$bg.style.backgroundPosition = settings.images[k];
				$wrapper.appendChild($bg);

				// Add it to array.
				$bgs.push($bg);

			}

			// Main loop.
			$bgs[pos].classList.add('visible');
			$bgs[pos].classList.add('top');

			// Bail if we only have a single BG or the client doesn't support transitions.
			if ($bgs.length == 1
				|| !canUse('transition'))
				return;

			window.setInterval(function () {

				lastPos = pos;
				pos++;

				// Wrap to beginning if necessary.
				if (pos >= $bgs.length)
					pos = 0;

				// Swap top images.
				$bgs[lastPos].classList.remove('top');
				$bgs[pos].classList.add('visible');
				$bgs[pos].classList.add('top');

				// Hide last image after a short delay.
				window.setTimeout(function () {
					$bgs[lastPos].classList.remove('visible');
				}, settings.delay / 2);

			}, settings.delay);
		};

		var changeBackgroundImage = function (image) {
			if (image) {
				settings.images = {};
				settings.images['images/' + image] = 'center';
				isAtDefault = false;
				init();
			} else {
				settings.images = {
					'images/bg01.jpg': 'center',
					'images/bg02.jpg': 'center',
					'images/bg03.jpg': 'center'
				};
				if (!isAtDefault) {
					init();
				}
				isAtDefault = true;
			}
		};

		init();

		return {
			changeBackgroundImage: changeBackgroundImage
		};
	}();

	// Time Console Form.
	var TimeConsole = function (backgroundManager) {

		var dateInputMask = function (elm) {
			elm.addEventListener('keypress', function (e) {
				var len = elm.value.length;

				if (len === 10 && e.keyCode == 13) {
					return;
				}

				if (e.keyCode < 47 || e.keyCode > 57) {
					e.preventDefault();
				}

				// If we're at a particular place, let the user type the slash
				// i.e., 12/12/1212
				if (len !== 1 || len !== 3) {
					if (e.keyCode == 47) {
						e.preventDefault();
					}
				}

				// If they don't add the slash, do it for them...
				if (len === 2) {
					elm.value += '/';
				}

				// If they don't add the slash, do it for them...
				if (len === 5) {
					elm.value += '/';
				}
			});
		};

		// Vars.
		var $form = document.querySelectorAll('#time-console-form')[0],
			$submit = document.querySelectorAll('#time-console-form input[type="submit"]')[0],
			$date = document.querySelectorAll('#time-console-form input[type="text"]')[0],
			$visor = document.querySelector('#visor'),
			$xmlhttp = new XMLHttpRequest(),
			$url = "data.json",
			$message;

		dateInputMask($date);

		// Set date to today
		$date.value = new Date().toLocaleDateString();

		// Bail if addEventListener isn't supported.
		if (!('addEventListener' in $form))
			return;

		// Visor
		$visor._update = function (text) {
			$visor.innerHTML = text;
		};

		// Message.
		$message = document.createElement('span');
		$message.classList.add('message');
		$form.appendChild($message);

		$message._show = function (type, text) {

			$message.innerHTML = text;
			$message.classList.add(type);
			$message.classList.add('visible');

			window.setTimeout(function () {
				$message._hide();
			}, 3000);

		};

		$message._hide = function () {
			$message.classList.remove('visible');
		};

		// Events.
		$form.addEventListener('submit', function (event) {
			event.stopPropagation();
			event.preventDefault();

			// Hide message.
			$message._hide();

			// Disable submit.
			$submit.disabled = true;

			// Process form.
			$xmlhttp.onreadystatechange = function () {
				if (this.readyState == 4) {
					if (this.status == 200) {
						var eventArray = JSON.parse(this.responseText);

						var beforeEvent, afterEvent, visorText, destination = new Date($date.value).setHours(1);

						var i;
						for (i = 0; i < eventArray.length; i++) {
							if (new Date(eventArray[i].date) <= destination) {
								beforeEvent = eventArray[i];
								afterEvent = eventArray[i - 1];
								break;
							}
						}

						var isAfterTheEvent = false;

						if (beforeEvent) {
							visorText = beforeEvent.afterText;
							isAfterTheEvent = true;
						} else {
							visorText = eventArray[eventArray.length - 1].beforeText;
						}

						if (afterEvent && (destination - new Date(beforeEvent.date) > new Date(afterEvent.date) - destination)) {
							visorText = afterEvent.beforeText;
						}

						if (isAfterTheEvent) {
							backgroundManager.changeBackgroundImage(beforeEvent.image);
						}

						// Visor update.
						$visor._update(visorText);

						// Enable submit.
						$submit.disabled = false;

						// Show message.
						$message._show('success', 'Reached the destination!');
					} else {
						// Show failure message.
						$message._show('failure', 'Something went wrong. Please try again.');
					}
				}
			};
			$xmlhttp.open("GET", $url + '?_=' + new Date().getTime(), true);
			$xmlhttp.send();

		});



	}(BackgroundManager);



})();
