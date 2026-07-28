(() => {
  const originalOrigin = "https://wuba.xiaofenglab.com";
  const localPageAliases = new Map([
    ["/", "/"],
    ["/home", "/"],
    ["/home.html", "/"],
    ["/models", "/models"],
    ["/models.html", "/models"],
    ["/planner", "/planner"],
    ["/planner.html", "/planner"],
    ["/viewer", "/viewer"],
    ["/viewer.html", "/viewer"],
    ["/item", "/item"],
    ["/item.html", "/item"],
    ["/downloads", "/downloads"],
    ["/downloads.html", "/downloads"],
    ["/studio", "/studio"],
    ["/studio.html", "/studio"],
    ["/outfield", "/outfield"],
    ["/outfield.html", "/outfield"],
  ]);
  const blockedFilePattern = /\.(?:zip|stl|3mf|stp|step)(?:$|[?#])/i;
  const brandPatterns = [
    [/五八智能科技（杭州）有限公司/g, "具身智能"],
    [/五八智能/g, "具身智能"],
    [/五八建模/g, "具身智能"],
    [/\bWUBA\b/gi, "具身智能"],
  ];

  const notify = (message = "公开展示版不提供文件下载") => {
    let toast = document.getElementById("public-download-notice");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "public-download-notice";
      Object.assign(toast.style, {
        position: "fixed",
        left: "50%",
        bottom: "28px",
        zIndex: "2147483647",
        transform: "translateX(-50%)",
        padding: "12px 18px",
        border: "1px solid rgba(255,255,255,.2)",
        borderRadius: "8px",
        background: "rgba(10,22,24,.94)",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow: "0 14px 40px rgba(0,0,0,.25)",
        opacity: "0",
        transition: "opacity .18s ease",
        pointerEvents: "none",
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    clearTimeout(window.__publicDownloadNoticeTimer);
    window.__publicDownloadNoticeTimer = setTimeout(() => {
      toast.style.opacity = "0";
    }, 1800);
  };

  const replaceBrandText = (value) => {
    let next = value;
    for (const [pattern, replacement] of brandPatterns) {
      next = next.replace(pattern, replacement);
    }
    return next;
  };

  const isDirectDownload = (anchor) => {
    const rawHref = anchor.getAttribute("href") || "";
    if (anchor.hasAttribute("download")) return true;
    if (blockedFilePattern.test(rawHref)) return true;
    if (/\/downloads\/.+/i.test(rawHref) && !/\/downloads\.html/i.test(rawHref)) return true;
    return false;
  };

  const disableDownload = (anchor) => {
    if (!isDirectDownload(anchor)) return;
    anchor.dataset.downloadDisabled = "true";
    anchor.classList.add("download-disabled");
    anchor.removeAttribute("download");
    anchor.setAttribute("href", "#");
    anchor.setAttribute("aria-label", `${anchor.textContent?.trim() || "下载"}（仅展示）`);
  };

  const normalizeLocalPageLink = (anchor) => {
    const rawHref = anchor.getAttribute("href") || "";
    if (!rawHref || rawHref.startsWith("#")) return;
    let url;
    try {
      url = new URL(rawHref, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin && url.origin !== originalOrigin) return;
    const localPath = localPageAliases.get(url.pathname);
    if (!localPath) return;
    anchor.setAttribute("href", `${localPath}${url.search}${url.hash}`);
  };

  const sanitizeLogo = (image) => {
    if (!(image instanceof HTMLImageElement)) return;
    if (!image.src.includes("wuba-intelligence-logo")) return;
    image.style.display = "none";
    const host = image.parentElement;
    if (!host || host.querySelector(".sanitized-brand-name")) return;
    const name = document.createElement("span");
    name.className = "sanitized-brand-name";
    name.textContent = "具身智能";
    host.appendChild(name);
  };

  const sanitizeElement = (root) => {
    if (!(root instanceof Element) && root !== document) return;
    const scope = root === document ? document.documentElement : root;
    if (!scope) return;

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const parent = textNode.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
      const next = replaceBrandText(textNode.nodeValue || "");
      if (next !== textNode.nodeValue) textNode.nodeValue = next;
    }

    const logos = [
      ...(scope.matches?.('img[src*="wuba-intelligence-logo"]') ? [scope] : []),
      ...scope.querySelectorAll('img[src*="wuba-intelligence-logo"]'),
    ];
    for (const image of logos) sanitizeLogo(image);

    const anchors = [
      ...(scope instanceof HTMLAnchorElement ? [scope] : []),
      ...scope.querySelectorAll("a"),
    ];
    for (const anchor of anchors) {
      normalizeLocalPageLink(anchor);
      disableDownload(anchor);
    }

    const labelled = [
      ...(scope.matches?.("[aria-label],[title]") ? [scope] : []),
      ...scope.querySelectorAll("[aria-label],[title]"),
    ];
    for (const element of labelled) {
      const ariaLabel = element.getAttribute("aria-label");
      const title = element.getAttribute("title");
      if (ariaLabel) {
        const next = replaceBrandText(ariaLabel);
        if (next !== ariaLabel) element.setAttribute("aria-label", next);
      }
      if (title) {
        const next = replaceBrandText(title);
        if (next !== title) element.setAttribute("title", next);
      }
    }

    document.title = replaceBrandText(document.title);
  };

  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patchedAnchorClick() {
    if (isDirectDownload(this) || this.dataset.downloadDisabled === "true") {
      notify();
      return;
    }
    return originalAnchorClick.call(this);
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a");
      const button = target?.closest("button");

      if (anchor instanceof HTMLAnchorElement) {
        if (isDirectDownload(anchor) || anchor.dataset.downloadDisabled === "true") {
          event.preventDefault();
          event.stopImmediatePropagation();
          notify();
          return;
        }

        let url;
        try {
          url = new URL(anchor.href, window.location.href);
        } catch {
          return;
        }
        const localPath = localPageAliases.get(url.pathname);
        if (url.origin === originalOrigin && localPath) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(`${localPath}${url.search}${url.hash}`);
          return;
        }
      }

      if (button && /下载|导出/.test(button.textContent || "")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        notify();
      }
    },
    true,
  );

  document.documentElement.style.visibility = "visible";

  const pendingRoots = new Set();
  let sanitationScheduled = false;
  const flushSanitation = () => {
    sanitationScheduled = false;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) sanitizeElement(root);
  };
  const scheduleSanitation = (root) => {
    pendingRoots.add(root);
    if (sanitationScheduled) return;
    sanitationScheduled = true;
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(flushSanitation, { timeout: 500 });
    } else {
      window.setTimeout(flushSanitation, 0);
    }
  };

  scheduleSanitation(document);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) scheduleSanitation(node);
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          scheduleSanitation(node.parentElement);
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
