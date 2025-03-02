import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

const Popup = () => {
  const [prLinks, setPrLinks] = useState<boolean>(true);
  const [issueLinks, setIssueLinks] = useState<boolean>(true);
  const [excludedClasses, setExcludedClasses] = useState<string>("");

  useEffect(() => {
    if (!chrome?.storage?.sync) return;

    chrome.storage.sync.get(
      ["prLinks", "issueLinks", "excludedClasses"],
      (data) => {
        setPrLinks(data.prLinks ?? true);
        setIssueLinks(data.issueLinks ?? true);
        setExcludedClasses(data.excludedClasses ?? "");
      },
    );
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ prLinks, issueLinks, excludedClasses }, () => {
      window.close();
    });
  };

  const checkboxStyle =
    "mr-2 h-[14px] w-[14px] cursor-pointer appearance-none rounded-[2px] border border-[#d0d7de] bg-white transition-all duration-150 checked:border-[#0969da] checked:bg-[#0969da]";

  return (
    <div className="min-w-[22rem] bg-white p-4 text-black">
      <div className="flex justify-center">
        <h2 className="pb-4 text-lg font-bold">GitHub Blank Link Setting</h2>
      </div>

      <div className="flex items-center pb-4 select-none">
        <input
          id="prLinks"
          type="checkbox"
          checked={prLinks}
          onChange={(e) => setPrLinks(e.target.checked)}
          className={checkboxStyle}
        />
        <label
          htmlFor="prLinks"
          className="cursor-pointer text-xs font-semibold text-[#1f2328]"
        >
          Add "_blank" to the PR page link
        </label>
      </div>

      <div className="flex items-center pb-4 select-none">
        <input
          id="issueLinks"
          type="checkbox"
          checked={issueLinks}
          onChange={(e) => setIssueLinks(e.target.checked)}
          className={checkboxStyle}
        />
        <label
          htmlFor="issueLinks"
          className="cursor-pointer text-xs font-semibold text-[#1f2328]"
        >
          Add "_blank" to the Issue page link
        </label>
      </div>

      <div className="mb-2">
        <label
          htmlFor="excludedClasses"
          className="mb-2 block text-xs font-semibold text-[#1f2328] select-none"
        >
          Exclude CSS classes (comma separated)
        </label>
        <input
          id="excludedClasses"
          type="text"
          value={excludedClasses}
          onChange={(e) => setExcludedClasses(e.target.value)}
          className="w-full rounded-[6px] border border-[#d0d7de] bg-[#f6f8fa] p-[5px] px-[12px] text-[14px] text-[#1f2328]"
        />
        <p className="mt-[4px] text-[12px] text-[#656d76]">
          Example: <code className="font-mono">no-blank,exclude-this</code>
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="cursor-pointer rounded-md bg-[#1f883d] px-3 py-1.5 font-semibold text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
