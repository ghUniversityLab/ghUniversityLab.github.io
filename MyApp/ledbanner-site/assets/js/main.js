/* ==========================================================================
   手持弹幕 官网 - main.js
   页面控制器：数据注入 / 导航 / 滚动动效 / 弹幕演示 / 公告渲染
   ========================================================================== */
(function (window, document) {
  "use strict";

  var CFG = window.SITE_CONFIG || { stores: {} };
  var ARTICLES = window.ARTICLES || [];
  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ======================================================================
     1. 全站信息注入（商店链接 / 二维码 / 主体信息 / 年份）
     ====================================================================== */
  function injectSiteInfo() {
    /* 下载按钮与文字链接：<a data-store="ios"> */
    $$("[data-store]").forEach(function (el) {
      var key = el.getAttribute("data-store");
      var store = CFG.stores && CFG.stores[key];
      if (!store) return;
      el.setAttribute("href", store.url);
      el.setAttribute("rel", "noopener");
      el.setAttribute("target", "_blank");
      if (!el.textContent.trim()) el.textContent = store.label + " 下载";
    });

    /* 二维码图片：<img data-qr="ios"> */
    $$("[data-qr]").forEach(function (img) {
      var key = img.getAttribute("data-qr");
      var store = CFG.stores && CFG.stores[key];
      if (!store) return;
      img.setAttribute("src", store.qr);
      img.setAttribute("alt", store.label + " 下载二维码");
    });

    /* 扫码提示文案：<span data-qr-tip="ios"> */
    $$("[data-qr-tip]").forEach(function (el) {
      var store = CFG.stores && CFG.stores[el.getAttribute("data-qr-tip")];
      if (store) el.textContent = store.tip;
    });

    /* 主体信息占位：<span data-legal="developer|icp|email"> */
    $$("[data-legal]").forEach(function (el) {
      var key = el.getAttribute("data-legal");
      if (key === "email") {
        el.textContent = CFG.email || "";
        if (el.tagName === "A") el.setAttribute("href", "mailto:" + CFG.email);
        return;
      }
      if (CFG[key]) {
        el.textContent = CFG[key];
        return;
      }
      /* 开发者署名 / 备案号留空时，连同外层的链接一起隐藏，
         避免页脚出现空链接或「粤ICP备XXX」占位 */
      var holder = el.closest("a") || el;
      holder.style.display = "none";
    });

    /* 站点名 */
    $$("[data-app-name]").forEach(function (el) {
      el.textContent = CFG.appName || "";
    });

    /* 年份 */
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ======================================================================
     2. 导航：滚动态 / 移动端菜单 / 滚动高亮 / 锚点平滑滚动
     ====================================================================== */
  function initNav() {
    var nav = $("#siteNav");
    var toggle = $("#navToggle");
    var menu = $("#navMenu");

    function onScroll() {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* 移动端菜单 */
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        menu.classList.toggle("is-open", !open);
      });
    }

    /* 点击锚点：关闭菜单 + 平滑滚动（偏移由 CSS scroll-padding-top 处理） */
    $$("a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        if (menu) menu.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
        /* 同步 URL，便于分享定位 */
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", id);
        }
      });
    });

    /* 滚动高亮当前区块 */
    var spyLinks = $$(".nav-menu__link[href^='#']");
    if (spyLinks.length && window.IntersectionObserver) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var id = en.target.id;
            spyLinks.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      spyLinks.forEach(function (l) {
        var t = document.getElementById(l.getAttribute("href").slice(1));
        if (t) spy.observe(t);
      });
    }
  }

  /* ======================================================================
     3. 滚动进场动画
     ====================================================================== */
  function initReveal() {
    var nodes = $$("[data-reveal]");
    if (!nodes.length) return;

    if (reduceMotion || !window.IntersectionObserver) {
      nodes.forEach(function (n) {
        n.classList.add("is-visible");
      });
      return;
    }

    /* 同组元素依次延迟，形成节奏 */
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var delay = parseInt(el.dataset.revealDelay || "0", 10);
          if (!delay) {
            var sibs = $$("[data-reveal]", el.parentElement);
            var idx = sibs.indexOf(el);
            if (idx > 0) delay = Math.min(idx, 4) * 90;
          }
          el.style.setProperty("--reveal-delay", delay + "ms");
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ======================================================================
     4. 右侧悬浮件：显示 / 回到顶部 / 二维码气泡
     ====================================================================== */
  function initFloatDock() {
    var dock = $("#floatDock");
    if (!dock) return;

    function onScroll() {
      dock.classList.toggle("is-visible", window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var top = $("#backTop");
    if (top) {
      top.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? "auto" : "smooth"
        });
      });
    }

    /* 移动端点按切换二维码气泡（hover 由 CSS 负责） */
    var qrWrap = $("#qrWrap");
    var qrPanel = $("#qrPanel");
    if (qrWrap && qrPanel) {
      qrWrap.addEventListener("click", function (e) {
        e.preventDefault();
        qrPanel.classList.toggle("is-open");
      });
      document.addEventListener("click", function (e) {
        if (!qrWrap.contains(e.target)) qrPanel.classList.remove("is-open");
      });
    }
  }

  /* ======================================================================
     5. 公告渲染
     ====================================================================== */
  function articleItemHTML(item) {
    return (
      '<a class="article__link" href="./article.html?id=' +
      item.id +
      '">' +
      '<div class="article__cover ' +
      item.cover +
      '"><b>' +
      (item.mark || "") +
      "</b></div>" +
      '<div class="article__body">' +
      '<div class="article__head">' +
      (item.tag ? '<span class="article__tag">' + item.tag + "</span>" : "") +
      "<h3>" +
      item.title +
      "</h3>" +
      "</div>" +
      '<p class="article__sum">' +
      item.sum +
      "</p>" +
      '<div class="article__date">' +
      item.date +
      "</div>" +
      "</div>" +
      "</a>"
    );
  }

  function renderArticleList(container, limit) {
    if (!container || !ARTICLES.length) return;
    var list = limit ? ARTICLES.slice(0, limit) : ARTICLES;
    container.innerHTML = list
      .map(function (item) {
        return "<li>" + articleItemHTML(item) + "</li>";
      })
      .join("");
  }

  function initArticlePage() {
    /* 首页：取最新 3 条 */
    renderArticleList($("#articleList"), 3);

    /* 公告列表页：全部，并支持按标签筛选 */
    var allBox = $("#articleListAll");
    if (allBox) {
      renderArticleList(allBox, 0);

      var filterBox = $("#articleFilter");
      if (filterBox) {
        var tags = [];
        ARTICLES.forEach(function (a) {
          if (a.tag && tags.indexOf(a.tag) === -1) tags.push(a.tag);
        });
        filterBox.innerHTML =
          '<button class="chip is-active" data-tag="all">全部</button>' +
          tags
            .map(function (t) {
              return '<button class="chip" data-tag="' + t + '">' + t + "</button>";
            })
            .join("");

        filterBox.addEventListener("click", function (e) {
          var btn = e.target.closest(".chip");
          if (!btn) return;
          $$(".chip", filterBox).forEach(function (b) {
            b.classList.toggle("is-active", b === btn);
          });
          var tag = btn.getAttribute("data-tag");
          var list = tag === "all" ? ARTICLES : ARTICLES.filter(function (a) {
            return a.tag === tag;
          });
          allBox.innerHTML = list.length
            ? list
                .map(function (item) {
                  return "<li>" + articleItemHTML(item) + "</li>";
                })
                .join("")
            : '<li class="article__empty">该分类下暂无公告</li>';
        });
      }
    }

    /* 公告详情页 */
    var detail = $("#articleDetail");
    if (detail) {
      var id = parseInt(
        (window.location.search.match(/[?&]id=(\d+)/) || [])[1] || "1",
        10
      );
      var item =
        ARTICLES.filter(function (a) {
          return a.id === id;
        })[0] || ARTICLES[0];
      if (!item) return;

      document.title = item.title + " - " + (CFG.appName || "手持弹幕");

      /* 头部：标题 / 面包屑 / 日期 */
      var titleEl = $("#articleTitle");
      if (titleEl) titleEl.textContent = item.title;
      var crumb = $("#articleCrumb");
      if (crumb) crumb.textContent = item.title;

      var meta = $(".page-hero__meta", document);
      if (meta) meta.textContent = item.date + " · " + (item.tag || "公告");

      detail.innerHTML = item.blocks.join("");
      detail.classList.add("is-ready");

      var cover = $("#articleCover");
      if (cover) {
        cover.className = "article__cover article__cover--lg " + item.cover;
        cover.innerHTML = "<b>" + (item.mark || "") + "</b>";
      }

      /* 上一篇 / 下一篇 */
      var idx = ARTICLES.indexOf(item);
      var prev = ARTICLES[(idx - 1 + ARTICLES.length) % ARTICLES.length];
      var next = ARTICLES[(idx + 1) % ARTICLES.length];
      var pn = $("#articleNav");
      if (pn) {
        pn.innerHTML =
          '<a class="article-nav__item" href="./article.html?id=' +
          prev.id +
          '"><span>上一篇</span><strong>' +
          prev.title +
          "</strong></a>" +
          '<a class="article-nav__item article-nav__item--next" href="./article.html?id=' +
          next.id +
          '"><span>下一篇</span><strong>' +
          next.title +
          "</strong></a>";
      }
    }
  }

  /* ======================================================================
     6. Hero 实时弹幕演示（纯展示，无交互控件）
     ====================================================================== */
  function initHeroDemo() {
    var el = $("#heroBanner");
    if (!el || !window.LedBanner) return;

    /* 文案由 i18n.js 按当前语言写进 dataset.ledText，这里直接读取 */
    var banner = new window.LedBanner(el, {
      text: el.dataset.ledText || "手持弹幕 · 为你打 CALL",
      color: "#ff2d3f",
      speed: 130,
      direction: "left"
    });

    window.__heroBanner = banner;
  }

  /* ======================================================================
     7. 功能 2：竖屏弹幕演示
     ====================================================================== */
  function initDemoPanel() {
    var el = $("#demoBanner");
    if (!el || !window.LedBanner) return;

    var banner = new window.LedBanner(el, {
      text: el.dataset.ledText || "为你打 CALL",
      color: "#ff0071",
      speed: 110,
      direction: "up"
    });

    window.__demoBanner = banner;
  }

  /* ======================================================================
     8. 页脚年份与备案链接
     ====================================================================== */
  function initMisc() {
    /* 主内容区标题平滑锚点已在 initNav 处理；此处处理外链安全属性 */
    $$("a[target='_blank']").forEach(function (a) {
      var rel = a.getAttribute("rel") || "";
      if (rel.indexOf("noopener") === -1) {
        a.setAttribute("rel", (rel + " noopener noreferrer").trim());
      }
    });
  }

  /* ======================================================================
     启动
     ====================================================================== */
  function boot() {
    injectSiteInfo();
    initNav();
    initReveal();
    initFloatDock();
    initArticlePage();
    initHeroDemo();
    initDemoPanel();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
