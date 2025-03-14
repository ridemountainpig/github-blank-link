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

    function shouldProcessLink(
      link: HTMLAnchorElement,
      settings: ExtensionSettings,
    ): boolean {
      const linkHref = link.getAttribute("href");
      if (!linkHref) return false;

      if (linkHref.startsWith("#")) return false;

      const currentPath = window.location.pathname;
      const isPRPage = currentPath.includes("/pull/");
      const isIssuePage = currentPath.includes("/issues/");

      if (
        !(
          (isPRPage && settings.prLinks) ||
          (isIssuePage && settings.issueLinks)
        )
      ) {
        return false;
      }

      try {
        const linkURL = new URL(linkHref, location.href);
        if (linkURL.pathname === currentPath) return false;
      } catch (e) {
        return false;
      }

      const excludedClasses = (settings.excludedClasses || "")
        .split(",")
        .map((cls: string) => cls.trim())
        .filter((cls: string) => cls.length > 0);

      if (
        excludedClasses.some((cls: string) => cls && link.closest("." + cls))
      ) {
        return false;
      }

      return true;
    }

    function applyTargetBlank(link: HTMLAnchorElement): void {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.setAttribute("data-target-processed", "true");
    }

    function processLink(
      link: HTMLAnchorElement,
      settings: ExtensionSettings,
    ): void {
      if (shouldProcessLink(link, settings)) {
        applyTargetBlank(link);
      }
    }

    function addTargetBlankToLinks(settings: ExtensionSettings): void {
      (
        document.querySelectorAll(
          "a:not([data-target-processed])",
        ) as NodeListOf<HTMLAnchorElement>
      ).forEach((link: HTMLAnchorElement) => {
        processLink(link, settings);
      });
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
