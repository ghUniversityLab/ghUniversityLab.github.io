#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
生成手持弹幕官网的下载二维码（目前仅 iOS）。

用法（在 ledbanner-site 目录下执行）：
    python tools/make-qr.py
    python tools/make-qr.py --ios "https://apps.apple.com/cn/app/id1234567890"

生成结果默认写入 assets/img/qr-ios.png。
注意：二维码内容必须与 assets/js/site-data.js 里的 SITE_CONFIG.stores 保持一致，
      否则落地页展示的下载地址会和二维码扫出来的地址不一致。

若后续上线 Android：加 --android "<商店链接>" 即可额外生成 qr-android.png，
并记得在 site-data.js 里补上 stores.android、在页面中加回 Android 入口。
"""
import argparse
import os
import sys

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_M
except ImportError:
    sys.exit("缺少依赖，请先安装：pip install \"qrcode[pil]\"")

# 与 assets/js/site-data.js 中的占位地址保持一致，替换后请同步修改
DEFAULT_IOS = "https://apps.apple.com/us/app/id6822303751?l=en-us"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def make(url, path, box_size=12, border=3):
    qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_M,
                       box_size=box_size, border=border)
    qr.add_data(url)
    qr.make(fit=True)
    # 深色用近黑而非纯黑，打印与屏幕显示都更柔和
    img = qr.make_image(fill_color="#111111", back_color="#FFFFFF")
    img.save(path)
    return qr.modules_count


def main():
    ap = argparse.ArgumentParser(description="生成下载二维码")
    ap.add_argument("--ios", default=DEFAULT_IOS, help="App Store 链接")
    ap.add_argument("--android", default=None,
                    help="Android 应用市场链接（可选，目前未上架 Android）")
    ap.add_argument("--out", default=os.path.join(ROOT, "assets", "img"), help="输出目录")
    args = ap.parse_args()

    if not os.path.isdir(args.out):
        os.makedirs(args.out)

    targets = [("qr-ios.png", args.ios)]
    if args.android:
        targets.append(("qr-android.png", args.android))

    for name, url in targets:
        path = os.path.join(args.out, name)
        modules = make(url, path)
        print("✓ %-14s %dx%d 模块  <- %s" % (name, modules, modules, url))

    print("\n完成。若链接有变动，请同步修改 assets/js/site-data.js 中的 SITE_CONFIG.stores。")


if __name__ == "__main__":
    main()
