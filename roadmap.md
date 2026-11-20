# Roadmap — "make it both mobile and web app"

Chosen without the user's answer (they skipped the question): phone-friendly layout **plus** an
installable home-screen app icon (manifest-only, no offline/service worker).

- [x] Audit all 4 pages at 390x844 and 1280x900 for layout problems
- [x] Fix phone layout issues found in the audit (bottom tab bar, card lists, stacked actions,
      full-width chart selects, single-column NN settings, plate not cropped on phones)
- [ ] Add web app manifest + app icons + matching head tags (theme-color, apple-touch-icon)
      — manifest + head tags done; icon artwork still being generated
- [ ] Verify: phone screenshots after fixes, manifest served, install prompt metadata present
- [ ] Keep desktop layout unchanged (regression check at 1280 wide)
- [ ] Commit
