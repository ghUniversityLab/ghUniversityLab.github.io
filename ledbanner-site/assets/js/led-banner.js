/* ==========================================================================
   手持弹幕 官网 - led-banner.js
   轻量 LED 弹幕引擎：滚动文字 / 变速 / 换色 / 四向滚动 / 离屏暂停
   零依赖，rAF 驱动，单实例约 0.5KB 内存开销
   ========================================================================== */
(function (window, document) {
  "use strict";

  var DEFAULTS = {
    text: "手持弹幕",
    color: "#ff2d3f",
    speed: 130, // px / 秒
    axis: "x", // x = 横向滚动，y = 纵向滚动
    direction: "left", // left | right | up | down
    playing: true
  };

  /* 方向 → 轴 的推断 */
  function inferAxis(direction) {
    return direction === "up" || direction === "down" ? "y" : "x";
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  function LedBanner(root, options) {
    if (!root) return;

    this.root = root;
    this.opt = Object.assign({}, DEFAULTS, options || {});
    if (options && options.direction) {
      this.opt.axis = inferAxis(options.direction);
    }

    /* DOM 引用 */
    this.mask = root.querySelector(".led-mask");
    this.track = root.querySelector(".led-track");
    if (!this.track) return;

    /* 把实例挂回根节点：切换语言时 i18n.js 通过它调用 setText 换文案 */
    root.__ledBanner = this;

    /* 运行态 */
    this.offset = 0;
    this.step = 0; // 一份文案 + 间距 的位移距离
    this.last = 0;
    this.raf = 0;
    this.visible = true;
    this._ready = false;

    this._init();
  }

  /* ------------------------------------------------------------------
     初始化
     ------------------------------------------------------------------ */
  LedBanner.prototype._init = function () {
    var self = this;

    this.root.dataset.axis = this.opt.axis;
    this._rebuild();

    /* 字体加载完成后尺寸会变化，需重新测量，避免出现跳帧 */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        self._rebuild();
        self._reset();
      });
    }

    /* 容器尺寸变化时重新测量 */
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(function () {
        clearTimeout(self._rt);
        self._rt = setTimeout(function () {
          self._rebuild();
          self._reset();
        }, 120);
      });
      this._ro.observe(this.root);
    } else {
      window.addEventListener("resize", function () {
        clearTimeout(self._rt);
        self._rt = setTimeout(function () {
          self._rebuild();
          self._reset();
        }, 150);
      });
    }

    /* 离屏暂停，避免整页多个弹幕同时空转 */
    if (window.IntersectionObserver) {
      this._io = new IntersectionObserver(
        function (entries) {
          self.visible = entries[0].isIntersecting;
          if (self.visible) self._start();
          else self._stop();
        },
        { rootMargin: "120px" }
      );
      this._io.observe(this.root);
    }

    this._reset();
    if (this.opt.playing) this._start();
  };

  /* 计算需要几份文案才能铺满屏幕（保证循环时不留空白） */
  LedBanner.prototype._rebuild = function () {
    var track = this.track;
    var axis = this.opt.axis;

    /* 先确保至少有两个副本用于测量与拼接 */
    while (track.children.length < 2) {
      track.appendChild(track.children[0].cloneNode(true));
    }

    /* 写入文案与颜色（用 textContent 避免注入） */
    var i;
    for (i = 0; i < track.children.length; i++) {
      var el = track.children[i];
      el.textContent = this.opt.text;
      el.style.setProperty("--led-color", this.opt.color);
      if (i > 0) el.setAttribute("aria-hidden", "true");
    }

    var first = track.children[0];
    var size = axis === "x" ? first.offsetWidth : first.offsetHeight;
    var gap = this._gap();

    this.step = Math.max(size + gap, 1);
    this.unit = size;

    /* 视口尺寸 */
    var view = axis === "x" ? this.root.clientWidth : this.root.clientHeight;

    /* 所需副本数：始终保证视口被铺满，且首尾无缝 */
    var need = Math.ceil((view + this.step) / this.step);
    need = Math.min(Math.max(need, 2), 8);

    if (need !== track.children.length) {
      while (track.children.length < need) {
        track.appendChild(track.children[0].cloneNode(true));
      }
      while (track.children.length > need) {
        track.removeChild(track.lastElementChild);
      }
      var j;
      for (j = 0; j < track.children.length; j++) {
        track.children[j].textContent = this.opt.text;
        track.children[j].style.setProperty("--led-color", this.opt.color);
        if (j > 0) track.children[j].setAttribute("aria-hidden", "true");
      }
    }

    this._ready = true;
  };

  /* 读取 track 上的间距（横向取 column-gap，纵向取 row-gap） */
  LedBanner.prototype._gap = function () {
    var cs = window.getComputedStyle(this.track);
    var v =
      this.opt.axis === "x"
        ? cs.columnGap || cs.gap
        : cs.rowGap || cs.gap;
    return num(v, 0);
  };

  /* 根据方向设置起始位移 */
  LedBanner.prototype._reset = function () {
    if (!this._ready) return;
    switch (this.opt.direction) {
      case "up":
        this.offset = 0;
        break;
      case "down":
        this.offset = -this.step;
        break;
      case "right":
        this.offset = -this.step;
        break;
      default:
        /* left */
        this.offset = 0;
    }
    this._apply();
  };

  LedBanner.prototype._apply = function () {
    var t =
      this.opt.axis === "x"
        ? "translate3d(" + this.offset.toFixed(2) + "px,0,0)"
        : "translate3d(0," + this.offset.toFixed(2) + "px,0)";
    this.track.style.transform = t;
  };

  /* ------------------------------------------------------------------
     动画循环
     ------------------------------------------------------------------ */
  LedBanner.prototype._loop = function (ts) {
    var self = this;
    if (!this.last) this.last = ts;
    var dt = (ts - this.last) / 1000;
    this.last = ts;
    /* 切标签页回来时 dt 可能很大，钳制一下避免"瞬移" */
    if (dt > 0.1) dt = 0.1;

    var d = this.opt.speed * dt;

    switch (this.opt.direction) {
      case "left":
        this.offset -= d;
        if (this.offset <= -this.step) this.offset += this.step;
        break;
      case "right":
        this.offset += d;
        if (this.offset >= 0) this.offset -= this.step;
        break;
      case "up":
        this.offset -= d;
        if (this.offset <= -this.step) this.offset += this.step;
        break;
      case "down":
        this.offset += d;
        if (this.offset >= 0) this.offset -= this.step;
        break;
    }

    this._apply();
    this.raf = window.requestAnimationFrame(function (t) {
      self._loop(t);
    });
  };

  LedBanner.prototype._start = function () {
    if (this.raf || !this.opt.playing) return;
    this.last = 0;
    var self = this;
    this.raf = window.requestAnimationFrame(function (t) {
      self._loop(t);
    });
  };

  LedBanner.prototype._stop = function () {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  };

  /* ------------------------------------------------------------------
     对外 API
     ------------------------------------------------------------------ */
  LedBanner.prototype.setText = function (text) {
    if (text === this.opt.text) return;
    this.opt.text = String(text == null ? "" : text);
    this._rebuild();
    this._reset();
  };

  LedBanner.prototype.setColor = function (color) {
    this.opt.color = color;
    var i;
    for (i = 0; i < this.track.children.length; i++) {
      this.track.children[i].style.setProperty("--led-color", color);
    }
  };

  LedBanner.prototype.setSpeed = function (speed) {
    this.opt.speed = Math.max(0, num(speed, this.opt.speed));
  };

  LedBanner.prototype.setDirection = function (direction) {
    this.opt.direction = direction;
    var axis = inferAxis(direction);
    if (axis !== this.opt.axis) {
      this.opt.axis = axis;
      this.root.dataset.axis = axis;
      this._rebuild();
    }
    this._reset();
  };

  LedBanner.prototype.play = function () {
    this.opt.playing = true;
    this._start();
  };

  LedBanner.prototype.pause = function () {
    this.opt.playing = false;
    this._stop();
  };

  LedBanner.prototype.destroy = function () {
    this._stop();
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    clearTimeout(this._rt);
  };

  /* ------------------------------------------------------------------
     静态方法：从标记初始化（data-led-* 属性驱动）
     ------------------------------------------------------------------ */
  LedBanner.autoInit = function (selector) {
    var nodes = document.querySelectorAll(selector || "[data-led]");
    var list = [];
    Array.prototype.forEach.call(nodes, function (el) {
      list.push(
        new LedBanner(el, {
          text: el.dataset.ledText || el.dataset.led || DEFAULTS.text,
          color: el.dataset.ledColor || DEFAULTS.color,
          speed: num(el.dataset.ledSpeed, DEFAULTS.speed),
          direction: el.dataset.ledDirection || DEFAULTS.direction,
          playing: el.dataset.ledPlaying !== "false"
        })
      );
    });
    return list;
  };

  window.LedBanner = LedBanner;
})(window, document);
