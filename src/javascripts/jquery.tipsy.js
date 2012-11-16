// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license
(function($) {

  function maybeCall(thing, ctx) {
    return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
  };

  function Tipsy(element, options) {
    this.$element = $(element);
    this.options = options;
    this.enabled = true;
    this.fixTitle();
  };

  Tipsy.prototype = {
    getEl: function() {
      var el;
      if (this.delegatedEl) {
        //console.log('tipsy has delegate el');
        el = $(this.delegatedEl);
      } else {
        el = this.$element;
      }
      return el;
    },
    show: function() {
      var el = this.getEl();

      this.quickShowState = 'in';

      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
      this.isShown = true;
      var title = this.getTitle();
      if (title && this.enabled) {
        var $tip = this.tip();

        $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
        $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
        $tip.remove().css({
          top: 0,
          left: 0,
          visibility: 'hidden',
          display: 'block'
        }).prependTo(document.body);

        var pos = $.extend({},
        el.offset(), {
          width: el[0].offsetWidth,
          height: el[0].offsetHeight
        });

        var actualWidth = $tip[0].offsetWidth,
        actualHeight = $tip[0].offsetHeight,
        gravity = maybeCall(this.options.gravity, el[0]);

        var tp;
        switch (gravity.charAt(0)) {
        case 'n':
          tp = {
            top: pos.top + pos.height + this.options.offset,
            left: pos.left + pos.width / 2 - actualWidth / 2
          };
          break;
        case 's':
          tp = {
            top: pos.top - actualHeight - this.options.offset,
            left: pos.left + pos.width / 2 - actualWidth / 2
          };
          break;
        case 'e':
          tp = {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth - this.options.offset
          };
          break;
        case 'w':
          tp = {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width + this.options.offset
          };
          break;
        }

        if (gravity.length == 2) {
          if (gravity.charAt(1) == 'w') {
            tp.left = pos.left + pos.width / 2 - 15;
          } else {
            tp.left = pos.left + pos.width / 2 - actualWidth + 15;
          }
        }

        $tip.css(tp).addClass('tipsy-' + gravity);
        $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
        if (this.options.className) {
          $tip.addClass(maybeCall(this.options.className, el[0]));
        }

        if (this.options.fade) {
          $tip.stop().css({
            opacity: 0,
            display: 'block',
            visibility: 'visible'
          }).animate({
            opacity: this.options.opacity
          });
        } else {
          $tip.css({
            visibility: 'visible',
            opacity: this.options.opacity
          });
        }
      }
    },

    hide: function() {
      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
      this.isShown = false;
      if (this.options.fade) {
        this.tip().stop().fadeOut(function() {
          $(this).remove();
        });
      } else {
        this.tip().remove();
      }
    },

    fixTitle: function() {
      var el = this.getEl();
      var $e = el;
      if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
        $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
      }
    },

    getTitle: function() {
      var $e = this.getEl();
      var title, o = this.options;
      this.fixTitle();
      var title, o = this.options;
      if (typeof o.title == 'string') {
        title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
      } else if (typeof o.title == 'function') {
        title = o.title.call($e[0]);
      }
      title = ('' + title).replace(/(^\s*|\s*$)/, "");
      return title || o.fallback;
    },

    tip: function() {
      if (!this.$tip) {
        this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
      }
      return this.$tip;
    },

    validate: function() {
      var el = this.getEl();
      if (!el.parentNode) {
        this.hide();
        this.$element = null;
        this.options = null;
      }
    },

    enable: function() {
      this.enabled = true;
    },
    disable: function() {
      this.enabled = false;
    },
    toggleEnabled: function() {
      this.enabled = !this.enabled;
    }
  };

  $.fn.tipsy = function(options) {

    if (options === true) {
      return this.data('tipsy');
    } else if (typeof options == 'string') {
      var tipsy = this.data('tipsy');
      if (tipsy) tipsy[options]();
      return this;
    }

    options = $.extend({},
    $.fn.tipsy.defaults, options);

    function get(ele) {
      var tipsy = $.data(ele, 'tipsy');
      if (!tipsy) {
        tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
        $.data(ele, 'tipsy', tipsy);
      }
      return tipsy;
    }

    function enterDelegate(event) {
      var el = event.currentTarget;
      var tipsy = get(this);
      tipsy.delegatedEl = el;
      enter.call(this);
    };

    function leaveDelegate(event) {
      var el = event.currentTarget;
      var tipsy = get(this);
      tipsy.delegatedEl = el;
      leave.call(this);
    };

    function clickDelegate(event) {
      var el = event.currentTarget;
      var tipsy = get(this);
      if (el === tipsy.delegatedEl) {
        click.call(this);
      }
    };

    function enter() {
      var tipsy = get(this);
      tipsy.hoverState = 'in';

      var delay = options.delayIn;
      var el = tipsy.getEl();
      if (el.attr('delayIn')) {
        delay = el.attr('delayIn');
      }

      if (delay == 0 || tipsy.quickShowState === 'in') {
        tipsy.show();
      } else {
        tipsy.fixTitle();
        tipsy.showTimeout = setTimeout(function() {
          if (tipsy.hoverState == 'in') {
            tipsy.show();
          }
        },
        delay);
      }

      clearTimeout(tipsy.quickShowTimeout);
    };

    function leave() {
      var tipsy = get(this);
      tipsy.hoverState = 'out';

      tipsy.quickShowTimeout = setTimeout(function() {
        tipsy.quickShowState = 'out';
      },
      options.quickShowDelay);

      if (options.delayOut == 0) {
        tipsy.hide();
      } else {
        tipsy.hideTimeout = setTimeout(function() {
          if (tipsy.hoverState == 'out') tipsy.hide();
        },
        options.delayOut);
      }
    };

    function click() {
      var tipsy = get(this);
      tipsy.hide();
      tipsy.hoverState = 'out';
      tipsy.quickShowState = 'out';
      clearTimeout(tipsy.quickShowTimeout);
      clearTimeout(tipsy.showTimeout);
      clearTimeout(tipsy.hideTimeout);
    };

    if (!options.live && !options.delegate) this.each(function() {
      get(this);
    });

    if (options.trigger != 'manual') {
      var eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus',
      eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';

      if (options.delegate) {
        var me = this;
        this.on(eventIn, options.delegate, function(event) {
          enterDelegate.call(me, event);
        });
        this.on(eventOut, options.delegate, function(event) {
          leaveDelegate.call(me, event);
        });
        this.on('click', options.delegate, function(event) {
          clickDelegate.call(me, event);
        });

      } else {
        var binder = options.live ? 'live' : 'bind';
        this[binder](eventIn, enter)[binder](eventOut, leave);
      }
    }

    return this;

  };

  $.fn.tipsy.defaults = {
    className: null,
    delayIn: 0,
    delayOut: 0,
    quickShowDelay: 500,
    fade: false,
    fallback: '',
    gravity: 'n',
    html: false,
    delegate: false,
    live: false,
    offset: 0,
    opacity: 0.8,
    title: 'title',
    trigger: 'hover'
  };

  // Overwrite this method to provide options on a per-element basis.
  // For example, you could store the gravity in a 'tipsy-gravity' attribute:
  // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
  // (remember - do not modify 'options' in place!)
  $.fn.tipsy.elementOptions = function(ele, options) {
    return $.metadata ? $.extend({},
    options, $(ele).metadata()) : options;
  };

  $.fn.tipsy.autoNS = function() {
    return $(this).offset().top > ($(document).scrollTop() + 50) ? 's' : 'n';
  };

  $.fn.tipsy.autoWE = function() {
    return $(this).offset().left > ($(document).scrollLeft() + 50) ? 'e' : 'w';
  };

  $.fn.tipsy.autoNESW = function() {
    var $elm = $(this);
    var $e = $elm.offset().left > ($(document).scrollLeft() + 50) ? 'e' : 'w';
    var $sn = $elm.offset().top > ($(document).scrollTop() + 50) ? 's' : 'n';
    return $sn + '' + $ew;
  };

  /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
  $.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {
        ns: prefer[0],
        ew: (prefer.length > 1 ? prefer[1] : false)
      },
      boundTop = $(document).scrollTop() + margin,
      boundLeft = $(document).scrollLeft() + margin,
      $this = $(this);

      if ($this.offset().top < boundTop) dir.ns = 'n';
      if ($this.offset().left < boundLeft) dir.ew = 'w';
      if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
      if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

      return dir.ns + (dir.ew ? dir.ew : '');
    }
  };

})(jQuery);
