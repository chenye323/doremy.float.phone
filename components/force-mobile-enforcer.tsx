"use client";

import { useLayoutEffect } from "react";

import { applyForceMobile, MOBILE_SHELL_MQ } from "@/lib/mobile-shell";

/**
 * 看门狗：Next.js 激活（hydration）会把 <html> 上的属性重置，抹掉首屏内联脚本
 * 打的 data-force-mobile，表现为"首屏满屏正常、一两秒后变回超宽桌面壳"。
 * 这里在客户端激活后立刻补回，并用 MutationObserver 盯住，一旦被再次抹掉就再补。
 * 只在媒体查询未命中、且物理判定为手机时才补（真触屏/桌面设备不受影响）。
 */
export function ForceMobileEnforcer() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      // 媒体查询已命中手机壳时无需强制标记（真机正常场景）
      if (window.matchMedia(MOBILE_SHELL_MQ).matches) {
        if (root.hasAttribute("data-force-mobile")) root.removeAttribute("data-force-mobile");
        return;
      }
      if (!root.hasAttribute("data-force-mobile")) applyForceMobile();
    };

    sync();

    const observer = new MutationObserver(() => {
      if (window.matchMedia(MOBILE_SHELL_MQ).matches) return;
      if (!root.hasAttribute("data-force-mobile")) applyForceMobile();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-force-mobile"] });

    return () => observer.disconnect();
  }, []);

  return null;
}
