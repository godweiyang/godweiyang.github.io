#!/bin/bash
# ============================================================================
# LOL 战绩查询本地服务 · macOS 一键安装脚本
#
# 作用：用 curl 下载（curl 不是“隔离感知”程序，下载的文件不会被打上
#       com.apple.quarantine 标记），从而绕过浏览器下载后首次打开需要到
#       “系统设置-隐私与安全性”里手动允许的 Gatekeeper 步骤；解压安装、
#       去除隔离属性、首次启动并注册 lolzjcx:// 协议、最后自检服务是否起来。
#
# 用法（终端粘贴一行）：
#   curl -fsSL https://godweiyang.com/medias/files/install_mac.sh | bash
# ============================================================================
set -euo pipefail

ZIP_URL="https://godweiyang.com/medias/files/lolzjcx_service_mac.zip"
APP_NAME="lolzjcx_service.app"
HEALTH_URL="http://127.0.0.1:17530/api/health"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo ">> 1/6 停止旧服务（若在运行）"
curl -fsS -X POST "http://127.0.0.1:17530/api/shutdown" -d '{}' >/dev/null 2>&1 || true
sleep 1

echo ">> 2/6 下载最新版（curl 下载不触发 Gatekeeper 隔离）"
curl -fL --progress-bar -o "$TMP/mac.zip" "$ZIP_URL"

echo ">> 3/6 解压"
( cd "$TMP" && unzip -q -o mac.zip )
if [ ! -d "$TMP/$APP_NAME" ]; then
  echo "!! 解压后未找到 $APP_NAME，下载包可能损坏，请重试" >&2
  exit 1
fi

echo ">> 4/6 选择安装目录"
if [ -w "/Applications" ]; then
  TARGET="/Applications"
else
  TARGET="$HOME/Applications"
  mkdir -p "$TARGET"
fi
rm -rf "$TARGET/$APP_NAME"
cp -R "$TMP/$APP_NAME" "$TARGET/"
APP_PATH="$TARGET/$APP_NAME"

# 防御性去除隔离属性（curl 下载本就没有，浏览器手动下载后跑本脚本也能清掉）
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
# 确保启动器具备可执行权限
chmod +x "$APP_PATH/Contents/MacOS/launcher" 2>/dev/null || true
echo "   已安装到：$APP_PATH"

echo ">> 5/6 首次启动并注册 lolzjcx:// 协议"
open "$APP_PATH"

echo ">> 6/6 自检服务状态"
ok=0
for i in $(seq 1 10); do
  sleep 1
  if curl -fsS "$HEALTH_URL" 2>/dev/null | grep -q '"ok": *true'; then ok=1; break; fi
done

if [ "$ok" = "1" ]; then
  echo ""
  echo "✅ 安装完成，本地服务已在运行。"
  echo "   回到网页刷新即可查询；以后点网页上的「启动服务」即可唤起，无需再跑本脚本。"
  echo "   账号数据目录：~/Library/Application Support/lolzjcx"
else
  echo ""
  echo "⚠️  服务未在 10 秒内响应。若这台 Mac 没有 python3，请先在终端执行："
  echo "      xcode-select --install"
  echo "   安装命令行工具后，重新运行本脚本，或双击 $APP_PATH 一次。"
  exit 1
fi
