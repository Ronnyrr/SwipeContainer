class SwipeContainer {
	constructor(el, nav) {
		this.el = el;
		this.navType = nav;

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
		this.navElement = document.createElement('footer');
		this.navElement.classList.add('swipe-container__progress', `swipe-container__progress--${this.navType}`);

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
			const progressElement = document.createElement('div');
			this.navElement.appendChild(progressElement);

			this.el.appendChild(this.navElement);

			this.navElement.children[0].style.width = `${100 / this.amountOfChildren}%`;
		} else if (this.navType === 'dots') {
			this.el.appendChild(this.navElement);

			for (let i = 0; i < this.amountOfChildren; i++) {
				const div = document.createElement('div');
				div.classList.add('progress-dot');

				if (i === 0) {
					div.classList.add('progress-dot--active');
				}

				this.navElement.appendChild(div);
			}
		}
	}

	/** Doesn't do anything yet **/
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
		this.animateElement.style.marginLeft = `-${this.position * this.childWidth}px`;

		// Animate the navigation part
		if (this.navType === 'bar') {
			this.navElement.children[0].style.left = `${this.position * (100 / this.amountOfChildren)}%`;
		} else if (this.navType === 'dots') {
			document.querySelector('.progress-dot--active').classList.remove('progress-dot--active');

			const progressDots = document.querySelectorAll('.progress-dot');
			progressDots[this.position].classList.add('progress-dot--active');
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
