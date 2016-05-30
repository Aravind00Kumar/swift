(function ($) {
    'use strict';
    var Scroll = function (element, options) {
        this.options = options
        this.$element = $(element)
        this.scrollPosition = this.options.position;
        this.init('scroll', element, options);
    }

    Scroll.DEFAULTS = {
        diaplay: 'always', // auto | always | none
        hideIn: 2000,    // milliseconds; only when display is 'auto'
        position: 0      // thumb position in px; 0 for when underflow; max when overflow
    }

    Object.defineProperties(Scroll.prototype, {
        "_TEMPLATE": {
            value: ['<div class="context"><div class="content">',
                   ' </div></div>',
                   ' <div class="shaft right">',
                   '     <div class="arrow up"> </div>',
                   '     <div class="thumb"> </div>',
                   '     <div class="arrow down"> </div>',
                   ' </div>'].join('')
        },
        "_CLASSES": {
            value: {
                pane: '.scroll-pane',
                content: '.content',
                context: '.context',
                shaft: '.shaft',
                arrowUp: '.up',
                arrowDown: '.down',
                thumb: '.thumb'
            }
        }

    });

    Scroll.prototype.__getElements = function ($element) {
        // cache all DOM elemnts
        return {
            pane: $element,
            content: $element.find('.content').first(),
            context: $element.find('.context').first(),
            shaft: $element.find('.shaft').first(),
            arrowUp: $element.find('.up').first(),
            arrowDown: $element.find('.down').first(),
            thumb: $element.find('.thumb').first()
        };
    }

    Scroll.prototype.__getPosition = function () {
        var contextHeight = this.elements.context.height()
        var contentHeight = this.elements.content.height()
        var value = 0;

        return {
            max: contentHeight - contextHeight,
            value: this.options.position, // check max before assigning
            page: contextHeight,
            point: 20
        }
    }

    Scroll.prototype.__setThumbHeight = function () {
        var activeShaftHeight = this.elements.shaft.height()
           - this.elements.arrowUp.height()
           - this.elements.arrowDown.height()

        var pageSize = (this.elements.context.height() * 100) / this.elements.content.height();

        var height = (pageSize * activeShaftHeight) / 100
        if (height <= 15) {
            height = 15;
        }
        this.elements.thumb.height(height);
    }

    Scroll.prototype.__setThumbPosition = function () {
        var move = (this.thumb.value * 100) / this.thumb.max;
        var top = (this.__getActiveShaftHeight() * move) / 100;
        this.elements.thumb.offset({
            top: this.elements.shaft.offset().top + top + this.elements.arrowUp.height()
        });
    }

    Scroll.prototype.__loadTemplate = function () {
        var $docFragment = $(document.createDocumentFragment());
        $docFragment.append(this._TEMPLATE);
        var elements = this.__getElements($docFragment);
        elements.content.html(this.$element.html());
        return $docFragment;
    }

    Scroll.prototype.__getActiveShaftHeight = function () {
        //return (this.__activeShaftHeight = this.elements.shaft.height()
        //                - this.elements.arrowUp.height()
        //                - this.elements.arrowDown.height()
        //                - this.elements.thumb.height());
        return (this.elements.shaft.height()
                        - this.elements.arrowUp.height()
                        - this.elements.arrowDown.height()
                        - this.elements.thumb.height());
    }

    Scroll.prototype.init = function (type, element, options) {
        var events = {
            mousein: 'mouseenter',
            mouseout: 'mouseleave',
            mousedown: 'mousedown',
            mousemove: 'mousemove',
            mouseup: 'mouseup',
            mousescroll: 'mousewheel',
            drag: 'drag',
            windowresize: 'resize'
        }

        var _that = this;

        this.enabled = true
        this.type = type
        this.$element = $(element)

        // mutation observer test
        var observer = new MutationObserver(function (mutations) {
            _that.refresh();
        });

        this.$element.each(function () {
            observer.observe(this, { attributes: true, childList: true, characterData: true });
        });


        var classes = this.$element.attr('class');
        classes = 'scroll-pane' + ' ' + classes;

        this.$element.html(this.__loadTemplate());
        this.$element.attr('class', classes);

        this.elements = this.__getElements(this.$element)

        this.refresh();

        switch (this.options.diaplay) {
            case 'always':
                break;
            case 'none':
                break;
            default:
                this.$element.on(events.mousein + '.' + this.type, $.proxy(this.enter, this))
                this.$element.on(events.mouseout + '.' + this.type, $.proxy(this.leave, this))
                this.leave();
                break;
        }

        this.$element.on(events.mousedown + '.' + this.type, this._CLASSES.arrowUp, $.proxy(this.arrowUp, this))
        this.$element.on(events.mousedown + '.' + this.type, this._CLASSES.arrowDown, $.proxy(this.arrowDown, this))
        this.$element.on(events.mousedown + '.' + this.type, this._CLASSES.shaft, $.proxy(this.shaft, this))
        this.$element.on(events.mousescroll + '.' + this.type, $.proxy(this.mousewheel, this))

        this.$element.on(events.mousedown + '.' + this.type, this._CLASSES.thumb, $.proxy(this.thumbPress, this))
        //this.$element.on(events.mousedown + '.' + this.type, this._CLASSES.shaft, $.proxy(this.thumbPress, this))
        $(document).on(events.mouseup + '.' + this.type, $.proxy(this.thumbRelease, this))
        $(window).resize($.proxy(this.refresh, this))

        this.$element.on(events.mousemove + '.' + this.type, $.proxy(this.thumbDrag, this))
        this.$element.on(events.mousein + '.' + this.type, $.proxy(this.clearMouseDown, this))

    }
    Scroll.prototype.refresh = function () {
        this.__setThumbHeight();
        this.thumb = this.__getPosition();
        this.__setThumbPosition();
    }

    Scroll.prototype.thumbPress = function (e) {
        this.isPressed = true;
        this.target = e;
    }
    Scroll.prototype.thumbRelease = function () {
        this.isPressed = false;
        this.target = null;
    }
    Scroll.prototype.thumbDrag = function (e) {
        if (this.isPressed) {
            e.preventDefault();
            var y = e.pageY - e.currentTarget.offsetTop;

            console.log(e.pageY - e.currentTarget.offsetTop)
            //var thumbpos = e.offsetY
            //                - this.target.offsetY
            //                - this.elements.arrowUp.height();

            var thumbpos = y
                            - this.target.offsetY
                            - this.elements.arrowUp.height();

            var thumbmove = (thumbpos / this.__getActiveShaftHeight()) * 100;

            var value = (this.thumb.max * thumbmove) / 100;

            if (this.thumb.value > value) this.up(this.thumb.value - value)
            else this.down(value - this.thumb.value)

            this.__setThumbPosition();
        }
    }
    Scroll.prototype.clearMouseDown = function () {
        if (this.isPressed === true) {
            this.thumbRelease();
        }
    }

    Scroll.prototype.enter = function () {
        this.$element.find(this._CLASSES.shaft).show()
        this.status = true;
    }
    Scroll.prototype.leave = function () {
        this.status = false;
        setTimeout($.proxy(this.hide, this), this.options.hideIn);
    }

    Scroll.prototype.hide = function () {
        if (this.status === false)
            this.$element.find(this._CLASSES.shaft).hide()
    }
    Scroll.prototype.show = function (_relatedTarget) {

        var that = this
        var e = $.Event('show.ak.scroll', { relatedTarget: _relatedTarget })

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

    }

    Scroll.prototype.up = function (point) {
        if (this.thumb.value <= 0) this.thumb.value = 0
        else if (this.thumb.value - point < 0) this.thumb.value = 0;
        else this.thumb.value = this.thumb.value - point;

        this.elements.content.css('top', -this.thumb.value);
    }
    Scroll.prototype.down = function (point) {
        if (this.thumb.value >= this.thumb.max) this.thumb.value = this.thumb.max;
        else if (this.thumb.value + point > this.thumb.max) this.thumb.value = this.thumb.value + (this.thumb.max - this.thumb.value)
        else this.thumb.value = this.thumb.value + point;
        this.elements.content.css('top', -this.thumb.value);
    }

    Scroll.prototype.arrowUp = function () {
        this.up(this.thumb.point);
        this.__setThumbPosition();
    }
    Scroll.prototype.arrowDown = function () {
        this.down(this.thumb.point);
        this.__setThumbPosition();
    }

    Scroll.prototype.shaft = function (e) {
        if ($(e.target).hasClass(this._CLASSES.shaft.replace('.', ''))) {
            if (e.offsetY > this.elements.thumb.position().top)
                this.down(this.thumb.page);
            else
                this.up(this.thumb.page);
            this.__setThumbPosition();
        }
    }

    Scroll.prototype.mousewheel = function (e) {
        if (e.originalEvent.wheelDelta < 0) {
            if (this.thumb.value < this.thumb.max) {
                e.preventDefault();
            }
            this.down(this.thumb.point);
        }
        else {
            if (this.thumb.value > 0) {
                e.preventDefault();
            }
            this.up(this.thumb.point);
        }
        this.__setThumbPosition();
    }

    $.fn.scroll = function (option, _relatedTarget) {

        var $this = this
        var data = $this.data('ak.scroll')
        var options = $.extend({}, Scroll.DEFAULTS, $this.data(), typeof option == 'object' && option)

        if (!data) $this.data('ak.scroll', (data = new Scroll(this, options)))
        if (typeof option == 'string') data[option](_relatedTarget)

        else if (options.show) data.show(_relatedTarget)

        return this;
    }

    $.fn.scroll.Constructor = Scroll

})(jQuery);
