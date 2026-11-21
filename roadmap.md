# Roadmap — "make it both mobile and web app"

Chosen without the user's answer (they skipped the question): phone-friendly layout **plus** an
installable home-screen app icon (manifest-only, no offline/service worker).

- [x] Add web app manifest + app icons + matching head tags (theme-color, apple-touch-icon)
- [x] Verify: phone screenshots after fixes, manifest + icons served, install metadata present,
      toast clears the tab bar, probability bars render, train -> predict flow works
- [x] Phone: scroll the prediction result into view after Predict; drop "on the left" copy
      that is wrong when the form stacks above the results
- [ ] Keep desktop layout unchanged (regression check at 1280 wide)
- [ ] Commit
- [ ] Verify: phone screenshots after fixes, manifest served, install prompt metadata present
- [ ] Keep desktop layout unchanged (regression check at 1280 wide)
- [ ] Commit
