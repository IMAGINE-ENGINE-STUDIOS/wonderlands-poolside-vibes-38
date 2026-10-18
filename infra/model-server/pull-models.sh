#!/usr/bin/env bash
# Download the Meta models THIS hardware tier can serve.
# Usage: ./pull-models.sh [rtx|workstation|datacenter]
#   rtx         — a consumer NVIDIA RTX (8-16 GB VRAM): the fast small tier
#   workstation — 24-48 GB VRAM: adds the mid-size code + 3.3 tiers (quantized)
#   datacenter  — 80 GB+ / multi-GPU: everything self-hostable
# Muse Spark Open is NOT in any tier: at 816B parameters (~1 TB of weights)
# it has no self-hosted run. The app catalogues it as hosted-only and the
# self-hosted chain answers in its place.
set -euo pipefail
TIER="${1:-rtx}"
pull() { echo "→ $1"; docker exec wonderlands-ollama ollama pull "$1" || curl -s http://localhost:11434/api/pull -d "{\"name\":\"$1\"}" >/dev/null && echo "  ok: $1"; }

# Every tier: the fast, always-available models.
pull llama3.1:8b        # 4.9 GB — Llama 3.1 8B, quick answers
pull codellama:7b       # Code Llama 7B

if [ "$TIER" = "workstation" ] || [ "$TIER" = "datacenter" ]; then
  pull codellama:13b    # Code Llama 13B
  pull codellama:34b    # Code Llama 34B (quantized on 24 GB)
fi

if [ "$TIER" = "datacenter" ]; then
  pull llama3.3:70b     # ~43 GB — the Genius default
  pull codellama:70b    # Code Llama 70B
  pull llama4:scout     # Llama 4 Scout — large; multi-GPU
  pull llama4:maverick  # Llama 4 Maverick — large; multi-GPU
fi

echo "Done ($TIER). Models the server does not have are skipped by the"
echo "fallback chain in supabase/functions/_shared/metaChat.ts."
