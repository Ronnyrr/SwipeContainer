export default class SwipeContainer {
	constructor(el, nav, extraIndicator = false) {
		this.el = el;
		this.navType = nav;
		this.extraIndicator = extraIndicator;

		this.init = this.init.bind(this);
		this.tap = this.tap.bind(this);
		this.drag = this.drag.bind(this);
		this.end = this.end.bind(this);

		this.progress = this.progress.bind(this);
		this.clickForProgress = this.clickForProgress.bind(this);
		this.changeProgression = this.changeProgression.bind(this);

		this.getByClass = this.getByClass.bind(this);

		this.init();
	}

	init() {
		this.animateElement = this.getByClass(this.el, 'swipe-container__contents');

		if (document.querySelector('.swipe-container--hotel-usp')) {
			this.calculatedHeight = document.querySelector('.swipe-container--hotel-usp').offsetHeight;
			document.querySelector('.swipe-container--hotel-usp').setAttribute('style', 'min-height:' + this.calculatedHeight + 'px');
		}

		this.animateChildren = this.animateElement.children;
		this.amountOfChildren = this.animateChildren.length;
		// Set width of animation container
		this.childWidth = this.animateChildren[0].offsetWidth + parseInt(window.getComputedStyle(this.animateChildren[0]).marginRight.slice(0, -2), 10);
		this.animateElement.style.width = `${(this.childWidth) * this.amountOfChildren}px`;

		// Variabeles for movement
		this.position = 0;
		this.direction = null;

		this.drag_enter = null;
		this.drag_leave = null;

		// Navigation
		this.navElement = this.getByClass(this.el, `swipe-container__progress--${this.navType}`);
		this.navPosition = 0; // (only for this.navType === 'nav')

		// Begin & bind
		if (this.navType !== 'none') {
			this.progress();
		}

		this.isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
		if (this.isMobile) {
			this.el.addEventListener('touchstart', this.tap);
		} else {
			this.el.setAttribute('draggable', 'true');

			for (let i = 0; i < this.animateChildren.length; i++) {
				this.animateChildren[i].setAttribute('draggable', 'false');
			}

			this.el.addEventListener('dragstart', this.tap);
		}
	}

	tap(ev) {
		ev.stopPropagation(); // Don't bubble up event chain

		if (this.isMobile) {
			this.drag_enter = ev.touches[0].pageX;

			document.body.addEventListener('touchmove', this.drag);
			document.body.addEventListener('touchend', this.end);
		} else {
			this.drag_enter = ev.pageX;

			document.body.addEventListener('drag', this.drag);
			document.body.addEventListener('dragend', this.end);
		}
	}

	drag(ev) {
		if (this.isMobile) {
			this.drag_leave = ev.touches[0].pageX;
		} else if (ev.pageX > 0) {
			this.drag_leave = ev.pageX;
		}
	}

	end() {
		const enter = this.drag_enter;
		const leave = this.drag_leave;

		const minSwipeRange = 90;

		// Detect swipe direction and range
		if (enter < leave && this.position > 0 && (leave - enter) > minSwipeRange) {
			this.position--;
			this.direction = 'right';
		} else if (enter > leave && this.position < (this.amountOfChildren - 1) && (enter - leave) > minSwipeRange) {
			this.position++;
			this.direction = 'left';
		} else {
			this.direction = null;
		}

		// If swipe range is large enough
		if (this.direction) {
			this.changeProgression();
		}

		if (this.isMobile) {
			document.body.removeEventListener('touchmove', this.drag);
			document.body.removeEventListener('touchend', this.end);
		} else {
			document.body.removeEventListener('drag', this.drag);
			document.body.removeEventListener('dragend', this.end);
		}
	}

	progress() {
		if (this.navType === 'bar') {
			this.navElement.children[0].style.width = `${100 / this.amountOfChildren}%`;
		} else if (this.navType === 'dots') {
			for (let i = 0; i < this.amountOfChildren; i++) {
				const div = document.createElement('div');
				div.classList.add('progress-dot');

				if (i === 0) {
					div.classList.add('progress-dot--active');
				}

				this.navElement.appendChild(div);
			}
		} else if (this.navType === 'nav') {
			this.progressNav = this.getByClass(this.navElement, 'progress--nav-list');

			for (let i = 0; i < this.progressNav.children.length; i++) {
				if (!this.isMobile) {
					this.progressNav.children[i].addEventListener('click', (ev) => this.clickForProgress(i, ev));
				}

				if (i === 0) {
					this.progressNav.children[i].classList.add('progress-nav--active');
				}
			}
		}
	}

	clickForProgress(index, ev) {
		if (ev.currentTarget.classList.contains('progress-nav--active')) {
			return;
		}

		if (index > this.position) {
			this.direction = 'left';
		} else if (index < this.position) {
			this.direction = 'right';
		}

		const difference = Math.abs(this.position - index);
		this.position = index;

		this.changeProgression(difference);
	}

	changeProgression(difference = 1) {
		// Animate the content part (except for bar with extraIndicator = true)
		if (this.extraIndicator && this.navType === 'bar') {
			const animateNavElem = document.querySelector('.swipe-container__progress--nav').children[1];
			const animateNavChildWidth = animateNavElem.children[0].offsetWidth + parseInt(window.getComputedStyle(this.animateChildren[0]).marginRight.slice(0, -2), 10);

			animateNavElem.style.marginLeft = `-${this.position * animateNavChildWidth}px`;
		} else {
			this.animateElement.style.marginLeft = `-${this.position * this.childWidth}px`;
		}

		// Animate the navigation part
		if (this.navType === 'bar') {
			this.navElement.children[0].style.left = `${this.position * (100 / this.amountOfChildren)}%`;
		} else if (this.navType === 'dots') {
			document.querySelector('.progress-dot--active').classList.remove('progress-dot--active');

			const progressDots = document.querySelectorAll('.progress-dot');
			progressDots[this.position].classList.add('progress-dot--active');
		} else if (this.navType === 'nav') {
			const progressNavs = this.getByClass(this.progressNav, 'progress-nav', true);

			let currentActive = null;
			for (let i = 0; i < progressNavs.length; i++) {
				if (progressNavs[i].classList.contains('progress-nav--active')) {
					currentActive = progressNavs[i];
					progressNavs[i].classList.remove('progress-nav--active');
				} else if (i === this.position) {
					progressNavs[i].classList.add('progress-nav--active');
				}
			}

			if (this.extraIndicator) {
				const childMargin = 20;

				if (this.direction === 'left') {
					this.navPosition -= (currentActive.offsetWidth + childMargin) * difference;
				} else if (this.direction === 'right') {
					this.navPosition += (currentActive.previousElementSibling.offsetWidth + childMargin) * difference;
				}

				this.progressNav.style.marginLeft = `${this.navPosition}px`;
			}

			// Reset folding areas on swipe
			const readMoreBtns = document.querySelectorAll('.swipe-container--hotel-description .expand-btn');
			if (typeof(readMoreBtns) !== 'undefined' && readMoreBtns !== null) {
				for (let i = 0; i < readMoreBtns.length; i++) {
					if (readMoreBtns[i].classList.contains('expand-btn--rotated')) {
						readMoreBtns[i].click();
					}
				}
			}
		}
	}

	getByClass(searchParent, classname, searchAll = false) {
		const itemsArr = [];
		for (let i = 0; i < searchParent.children.length; i++) {
			if (searchParent.children[i].classList.contains(classname)) {
				if (searchAll) {
					itemsArr.push(searchParent.children[i]);
				} else {
					return searchParent.children[i];
				}
			}
		}

		return itemsArr;
	}
}
