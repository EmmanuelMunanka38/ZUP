# Stitch / Piki Design Audit and Recommended Changes

## What I found
- Design folder: `stitch_piki_food_delivery_app/` contains multiple `code.html` files (splash_screen, onboarding, login, your_cart, track_your_order, my_profile, etc.) and embedded image assets (external image URLs described in HTML). The design uses:
  - Brand: "Piki Food"
  - Primary color: #006d36
  - Secondary container: #fdc003
  - Font family: Plus Jakarta Sans
  - Visuals: radial splash gradient, moped icon, rounded cards, soft shadows

## Matches in codebase (quick check)
- Onboarding screen: `app/(auth)/onboarding.tsx` — structure, brand text and CTA buttons present. Uses placeholder images (Unsplash) instead of design PNGs.
- Buttons/components: `components/ui/PikiButton.tsx`, `PikiInput.tsx`, `PikiCard.tsx` — variants and props exist and align with design intent.
- Brand/footers: `app/(auth)/index.tsx` contains "Piki Food" and "Brought to you by Piki Tech" strings.
- Order tracking & cart: app pages reference order numbers and rider labels matching design text (e.g., Order #PIKI-8829).

## Gaps / Deviations (recommended fixes)
1. Assets
   - Replace placeholder onboarding images with the PNG/illustrations from `stitch_piki_food_delivery_app/*` (copy locally into an assets/designs/ folder and reference them).
2. Splash
   - Implement native splash using the design's radial gradient (#0fa958 -> #006d36) and include the moped icon + "Haraka Sana" tagline.
   - Ensure footer text "Brought to you by Piki Tech" appears on relevant auth screens.
3. Theme / tokens
   - Sync theme constants with design colors (primary: #006d36, secondary-container: #fdc003, on-primary: #ffffff, etc.). Update `constants/theme` accordingly.
   - Match borderRadius and spacing tokens: container-padding 20px, borderRadius xl ~0.75rem.
4. Typography
   - Add Plus Jakarta Sans to mobile (bundle or use @expo-google-fonts) and update Typography tokens for h1/h2/display sizes shown in design.
5. Components
   - Verify PikiButton variants visually match design: rounded radius, shadow, outline thickness. Add a loading state color fallback to match design.
6. Small layout details
   - Dots and loading indicator sizing on onboarding should match design (dot size 8px; active color primary).
   - Ensure card corners, image radii and drop shadows align with HTML CSS values.

## Next steps / Checklist
- [ ] Copy PNG/HTML assets from `stitch_piki_food_delivery_app/` into `assets/designs/`.
- [ ] Update `constants/theme` with exact hex tokens from design.
- [ ] Add Plus Jakarta Sans to the app fonts and update Typography.
- [ ] Replace onboarding image URLs with local assets and tweak image/container radii.
- [ ] Implement native splash per design (Expo: `app.json`/`app.config` + static image or gradient overlay).
- [ ] Tweak PikiButton styles to precisely match design tokens.

If you want, start applying these changes now — I can create commits that:
- add the assets, update theme constants, and update the onboarding and splash implementations.

