if (
  !document.documentElement.hasAttribute(
    "data-github-blank-link-extension-loaded",
  )
) {
  document.documentElement.setAttribute(
    "data-github-blank-link-extension-loaded",
    "true",
  );

  (function () {
    interface ExtensionSettings {
      prLinks: boolean;
      issueLinks: boolean;
      excludedClasses: string;
    }

    const defaultSettings: ExtensionSettings = {
      prLinks: true,
      issueLinks: true,
      excludedClasses: "AppHeader",
    };

    let cachedSettings: ExtensionSettings = { ...defaultSettings };

    function addTargetBlankToLinks(settings: ExtensionSettings): void {
      const path = window.location.pathname;
      const isPRPage = path.includes("/pull/");
      const isIssuePage = path.includes("/issues/");

      if (
        (isPRPage && settings.prLinks) ||
        (isIssuePage && settings.issueLinks)
      ) {
        (
          document.querySelectorAll(
            "a:not([data-target-processed])",
          ) as NodeListOf<HTMLAnchorElement>
        ).forEach((link: HTMLAnchorElement) => {
          const excludedClasses = (settings.excludedClasses || "")
            .split(",")
            .map((cls: string) => cls.trim())
            .filter((cls: string) => cls.length > 0);

          if (
            excludedClasses.some(
              (cls: string) => cls && link.closest("." + cls),
            )
          ) {
            return;
          }

          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
          link.setAttribute("data-target-processed", "true");
        });
      }
    }

    function processAddedNodes(
      addedNodes: NodeList,
      settings: ExtensionSettings,
    ): void {
      addedNodes.forEach((node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.tagName === "A" &&
            !element.hasAttribute("data-target-processed")
          ) {
            processLink(element as HTMLAnchorElement, settings);
          }

          const links = element.querySelectorAll(
            "a:not([data-target-processed])",
          );
          links.forEach((link) =>
            processLink(link as HTMLAnchorElement, settings),
          );
        }
      });
    }

    function processLink(
      link: HTMLAnchorElement,
      settings: ExtensionSettings,
    ): void {
      const path = window.location.pathname;
      const isPRPage = path.includes("/pull/");
      const isIssuePage = path.includes("/issues/");

      if (
        (isPRPage && settings.prLinks) ||
        (isIssuePage && settings.issueLinks)
      ) {
        const excludedClasses = (settings.excludedClasses || "")
          .split(",")
          .map((cls: string) => cls.trim())
          .filter((cls: string) => cls.length > 0);

        if (
          excludedClasses.some((cls: string) => cls && link.closest("." + cls))
        ) {
          return;
        }

        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.setAttribute("data-target-processed", "true");
      }
    }

    // 直接處理 mutations，不使用 debounce
    const observer = new MutationObserver(
      (mutations: MutationRecord[]): void => {
        mutations.forEach((mutation: MutationRecord) => {
          if (mutation.type === "childList") {
            processAddedNodes(mutation.addedNodes, cachedSettings);
          }
        });
      },
    );

    function initializeExtension(): void {
      chrome.storage.sync.get(
        ["prLinks", "issueLinks", "excludedClasses"],
        (settings: { [key: string]: any }) => {
          if (
            settings.prLinks === undefined &&
            settings.issueLinks === undefined &&
            settings.excludedClasses === undefined
          ) {
            chrome.storage.sync.set(defaultSettings);
            cachedSettings = { ...defaultSettings };
          } else {
            cachedSettings = {
              prLinks: settings.prLinks ?? true,
              issueLinks: settings.issueLinks ?? true,
              excludedClasses: settings.excludedClasses ?? "",
            };
          }

          addTargetBlankToLinks(cachedSettings);
          observer.observe(document.body, { childList: true, subtree: true });
        },
      );
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeExtension);
    } else {
      initializeExtension();
    }

    chrome.storage.onChanged.addListener(
      (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.prLinks || changes.issueLinks || changes.excludedClasses) {
          chrome.storage.sync.get(
            ["prLinks", "issueLinks", "excludedClasses"],
            (newSettings: { [key: string]: any }) => {
              cachedSettings = {
                prLinks: newSettings.prLinks ?? true,
                issueLinks: newSettings.issueLinks ?? true,
                excludedClasses: newSettings.excludedClasses ?? "",
              };

              (
                document.querySelectorAll(
                  "a[data-target-processed]",
                ) as NodeListOf<HTMLAnchorElement>
              ).forEach((link: HTMLAnchorElement) => {
                link.removeAttribute("data-target-processed");
              });

              addTargetBlankToLinks(cachedSettings);
            },
          );
        }
      },
    );
  })();
}
