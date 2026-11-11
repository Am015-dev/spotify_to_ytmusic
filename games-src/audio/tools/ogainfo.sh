#!/bin/bash
s=$1; f=games-src/audio/raw/oga/$s.html
[ -s $f ] || curl -sS "https://opengameart.org/content/$s" > $f
echo "### $s | $(grep -oE '<title>[^<|]+' $f | sed 's/<title>//') | $(grep -oE 'field-name-author-submitter.{0,400}' $f | grep -oE 'href="/users/[^"]+">[^<]+' | head -1 | sed 's/.*">//') | LIC: $(grep -oE "license-name'?\"?>[^<]+" $f | sed -E "s/.*>//" | sort -u | tr '\n' ',')"
grep -oE 'https://opengameart.org/sites/default/files/[^"'"'"']+' $f | grep -vE '/(css|js|license_images|styles)/|\.(png|jpg|gif)$' | sort -u
