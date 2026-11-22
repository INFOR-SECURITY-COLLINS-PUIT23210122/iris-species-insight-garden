# Roadmap — "make it both mobile and web app"

Chosen without the user's answer (they skipped the question): phone-friendly layout **plus** an
installable home-screen app icon (manifest-only, no offline/service worker).

- [x] Audit all 4 pages at 390x844 and 1280x900 for layout problems
- [x] Fix phone layout issues (bottom tab bar, card lists, stacked panel actions,
      full-width chart selects, single-column NN settings, plate not cropped on phones)
- [x] Add web app manifest + app icons + matching head tags (theme-color, apple-touch-icon)
- [x] Verify: manifest + icons served, install metadata present, toast clears the tab bar,
      probability bars render, train -> predict flow works on a phone
- [x] Phone: scroll the prediction result into view after Predict; drop copy that pointed
      "to the left" when the form stacks above the results
- [x] Keep desktop layout unchanged (1280 wide: no overflow, header intact, no page jump)
- [x] Commit

# Roadmap — offline installed app
- [x] Save dataset, settings and trained model on the device; restore on open
- [x] Offline worker (guarded, never in preview) caching pages and app files
- [x] Tests for model restore and preview guards

# Roadmap — prediction history + phone table
- [x] Save each prediction on the device; recent list on Predict
- [x] Data table fits phones with all columns
