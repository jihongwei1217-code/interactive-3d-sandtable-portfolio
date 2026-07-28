(() => {
  const originalOrigin = "https://wuba.xiaofenglab.com";
  const localPages = new Set([
    "/",
    "/home.html",
    "/models.html",
    "/planner.html",
    "/viewer.html",
    "/item.html",
    "/downloads.html",
    "/studio.html",
    "/outfield.html",
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

    const elements = [scope, ...scope.querySelectorAll("*")];
    for (const element of elements) {
      if (element instanceof HTMLImageElement) {
        sanitizeLogo(element);
        if (element.alt) element.alt = replaceBrandText(element.alt);
      }
      if (element instanceof HTMLAnchorElement) disableDownload(element);
      if (element.hasAttribute?.("aria-label")) {
        element.setAttribute(
          "aria-label",
          replaceBrandText(element.getAttribute("aria-label") || ""),
        );
      }
      if (element.hasAttribute?.("title")) {
        element.setAttribute("title", replaceBrandText(element.getAttribute("title") || ""));
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
        if (url.origin === originalOrigin && localPages.has(url.pathname)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const localPath = url.pathname === "/" ? "/home.html" : url.pathname;
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

  sanitizeElement(document);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) sanitizeElement(node);
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          sanitizeElement(node.parentElement);
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.documentElement.style.visibility = "visible";
})();
