#!/bin/bash
# ============================================================================
# 小区综合打分 · 贝壳本地服务 · macOS 一键安装
#
# 用 curl 下载（curl 不是“隔离感知”程序，下到的文件不会带 com.apple.quarantine
# 标记），再自动解压、装进“应用程序”、清掉隔离属性并首次启动，因此不用去
# “系统设置-隐私与安全性”里手动允许未签名 App。
#
# 用法（终端粘贴一行）：
#   curl -fsSL https://godweiyang.com/medias/files/install_amenity_mac.sh | bash
# ============================================================================
set -euo pipefail

BASE="https://godweiyang.com/medias/files"
APP_NAME="amenity_service.app"
HEALTH_URL="http://127.0.0.1:17532/api/health"

case "$(uname -m)" in
  arm64)
    ZIP="$BASE/amenity_service_mac_arm64.zip"
    LABEL="Apple Silicon（arm64）"
    ;;
  x86_64)
    ZIP="$BASE/amenity_service_mac_intel.zip"
    LABEL="Intel（x86_64）"
    ;;
  *)
    echo "!! 不支持的架构：$(uname -m)" >&2
    exit 1
    ;;
esac

echo ">> 1/6 停掉正在运行的旧服务"
curl -fsS -X POST "http://127.0.0.1:17532/api/shutdown" -d '{}' >/dev/null 2>&1 || true
sleep 1

echo ">> 2/6 下载 $LABEL 版本（curl 下载不带隔离标记）"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fL --progress-bar -o "$TMP/mac.zip" "$ZIP"

echo ">> 3/6 解压"
( cd "$TMP" && (ditto -x -k mac.zip . 2>/dev/null || unzip -q -o mac.zip) )
if [ ! -d "$TMP/$APP_NAME" ]; then
  echo "!! 包内没有 $APP_NAME，下载可能损坏，请重试" >&2
  exit 1
fi

echo ">> 4/6 安装"
if [ -w "/Applications" ]; then
  TARGET="/Applications"
else
  TARGET="$HOME/Applications"
  mkdir -p "$TARGET"
fi
rm -rf "$TARGET/$APP_NAME"
cp -R "$TMP/$APP_NAME" "$TARGET/"
APP_PATH="$TARGET/$APP_NAME"

# 浏览器手动下载过的包也能一并清掉隔离属性
xattr -cr "$APP_PATH" 2>/dev/null || true
chmod +x "$APP_PATH/Contents/MacOS/amenity_service" 2>/dev/null || true
echo "   已安装到：$APP_PATH"

echo ">> 5/6 首次启动（顺带注册 amenity:// 协议）"
open "$APP_PATH" || true

echo ">> 6/6 自检服务"
ok=0
for _ in $(seq 1 15); do
  sleep 1
  if curl -fsS "$HEALTH_URL" 2>/dev/null | grep -q '"service": *"amenity-local"'; then
    ok=1
    break
  fi
done

if [ "$ok" = "1" ]; then
  echo ""
  echo "✅ 安装完成，本机服务已在 127.0.0.1:17532 运行。"
  echo "   回到 https://godweiyang.com/amenity/ 点「连接贝壳」即可；"
  echo "   以后服务没起来时，点网页上的「启动服务」或再跑一遍这条命令都能拉起。"
else
  echo ""
  echo "⚠️  服务 15 秒内没有响应。可在「系统设置 → 隐私与安全性」里允许一次，"
  echo "   或手动双击：$APP_PATH ；仍然不行就再跑一遍本脚本。"
  exit 1
fi
