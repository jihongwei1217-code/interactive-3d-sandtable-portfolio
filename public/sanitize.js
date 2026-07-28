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
  const brandAssetMap = new Map([
    ["/images/home/1d60d202169655264d14f5a6a3b3a621(1).webp", "/brand-safe/images/hero-d12.webp"],
    ["/images/home/人形机器人正面(1).jpg", "/brand-safe/images/d12-front.webp"],
    ["/images/home/wuba-q20-hero-v2.webp", "/brand-safe/images/hero-q20.webp"],
    ["/images/home/746bcde2b8d2360fce66a855ecca3711(1).webp", "/brand-safe/images/q20-public-safety.webp"],
    ["/images/home/2702d950300af445ee35a1f7c88edbb0(1).webp", "/brand-safe/images/q20-field.webp"],
    ["/images/home/wuba-applications-v2.webp", "/brand-safe/images/applications.webp"],
    ["/images/equipment/09-humanoid.webp", "/brand-safe/images/equipment-09.webp"],
    ["/images/equipment/10-q25.webp", "/brand-safe/images/equipment-10.webp"],
    ["/images/ai-training-center/seated-robot-2-reference.webp", "/brand-safe/images/ai-seated-robot-2.webp"],
  ]);
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

  const mapBrandAsset = (value) => {
    if (!value) return value;
    try {
      const url = new URL(value, window.location.href);
      const path = decodeURI(url.pathname);
      return brandAssetMap.get(path) || value;
    } catch {
      return value;
    }
  };

  const mapSourceSet = (value) =>
    value
      .split(",")
      .map((candidate) => {
        const trimmed = candidate.trim();
        if (!trimmed) return trimmed;
        const splitAt = trimmed.search(/\s/);
        const source = splitAt === -1 ? trimmed : trimmed.slice(0, splitAt);
        const descriptor = splitAt === -1 ? "" : trimmed.slice(splitAt);
        return `${mapBrandAsset(source)}${descriptor}`;
      })
      .join(", ");

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
    image.setAttribute("src", "/brand-safe/embodied-mark.svg");
    image.removeAttribute("srcset");
    image.style.display = "";
    image.setAttribute("alt", "");
    image.setAttribute("aria-hidden", "true");
    const host = image.parentElement;
    if (!host || host.querySelector(".sanitized-brand-name")) return;
    const name = document.createElement("span");
    name.className = "sanitized-brand-name";
    name.textContent = "具身智能";
    host.appendChild(name);
  };

  const sanitizeImageSource = (image) => {
    if (!(image instanceof HTMLImageElement)) return;
    sanitizeLogo(image);
    const rawSource = image.getAttribute("src");
    const mappedSource = mapBrandAsset(rawSource);
    if (mappedSource && mappedSource !== rawSource) {
      image.setAttribute("src", mappedSource);
    }
    const rawSourceSet = image.getAttribute("srcset");
    if (rawSourceSet) {
      const mappedSourceSet = mapSourceSet(rawSourceSet);
      if (mappedSourceSet !== rawSourceSet) {
        image.setAttribute("srcset", mappedSourceSet);
      }
    }
  };

  const sanitizePictureSource = (source) => {
    if (!(source instanceof HTMLSourceElement)) return;
    const rawSourceSet = source.getAttribute("srcset");
    if (!rawSourceSet) return;
    const mappedSourceSet = mapSourceSet(rawSourceSet);
    if (mappedSourceSet !== rawSourceSet) {
      source.setAttribute("srcset", mappedSourceSet);
    }
  };

  const ensureBrandNameIcon = (name) => {
    if (!(name instanceof HTMLElement)) return;
    const host = name.parentElement;
    if (host?.querySelector('img[src*="/brand-safe/embodied-mark.svg"]')) return;
    if (name.querySelector(".sanitized-brand-icon")) return;
    const icon = document.createElement("img");
    icon.className = "sanitized-brand-icon";
    icon.src = "/brand-safe/embodied-mark.svg";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    Object.assign(icon.style, {
      width: "32px",
      height: "32px",
      marginRight: "10px",
      borderRadius: "8px",
      objectFit: "cover",
      flex: "0 0 auto",
    });
    name.prepend(icon);
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

    const images = [
      ...(scope instanceof HTMLImageElement ? [scope] : []),
      ...scope.querySelectorAll("img"),
    ];
    for (const image of images) sanitizeImageSource(image);

    const sources = [
      ...(scope instanceof HTMLSourceElement ? [scope] : []),
      ...scope.querySelectorAll("source[srcset]"),
    ];
    for (const source of sources) sanitizePictureSource(source);

    const brandNames = [
      ...(scope.matches?.(".sanitized-brand-name") ? [scope] : []),
      ...scope.querySelectorAll(".sanitized-brand-name"),
    ];
    for (const name of brandNames) ensureBrandNameIcon(name);

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
      if (record.type === "attributes" && record.target instanceof Element) {
        scheduleSanitation(record.target);
      }
      for (const node of record.addedNodes) {
        if (node instanceof Element) scheduleSanitation(node);
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          scheduleSanitation(node.parentElement);
        }
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset"],
  });
})();
