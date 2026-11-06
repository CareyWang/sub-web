#!/bin/sh
set -eu

escape() {
  printf '%s' "$1" | tr '\n' ' ' | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF
window.__SUB_WEB_CONFIG__ = {
  VITE_PROJECT: "$(escape "${VITE_PROJECT:-}")",
  VITE_BOT_LINK: "$(escape "${VITE_BOT_LINK:-}")",
  VITE_BACKEND_RELEASE: "$(escape "${VITE_BACKEND_RELEASE:-}")",
  VITE_SUBCONVERTER_REMOTE_CONFIG: "$(escape "${VITE_SUBCONVERTER_REMOTE_CONFIG:-}")",
  VITE_SUBCONVERTER_DOC_ADVANCED: "$(escape "${VITE_SUBCONVERTER_DOC_ADVANCED:-}")",
  VITE_SUBCONVERTER_DEFAULT_BACKEND: "$(escape "${VITE_SUBCONVERTER_DEFAULT_BACKEND:-}")",
  VITE_MYURLS_API: "$(escape "${VITE_MYURLS_API:-}")",
  VITE_CONFIG_UPLOAD_API: "$(escape "${VITE_CONFIG_UPLOAD_API:-}")",
  VITE_USE_STORAGE: "$(escape "${VITE_USE_STORAGE:-}")",
  VITE_CACHE_TTL: "$(escape "${VITE_CACHE_TTL:-}")"
}
EOF
