export function encodePlist(s) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>data</key>
  <string>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>
</dict>
</plist>`;
}