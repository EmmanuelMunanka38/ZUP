---
name: Modern African Urbanity
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6d7b6d'
  outline-variant: '#bccabb'
  surface-tint: '#006d36'
  primary: '#006d36'
  on-primary: '#ffffff'
  primary-container: '#0fa958'
  on-primary-container: '#003416'
  inverse-primary: '#5bdf87'
  secondary: '#785900'
  on-secondary: '#ffffff'
  secondary-container: '#fdc003'
  on-secondary-container: '#6c5000'
  tertiary: '#a93249'
  on-tertiary: '#ffffff'
  tertiary-container: '#ee667b'
  on-tertiary-container: '#5f001c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#79fca0'
  primary-fixed-dim: '#5bdf87'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#ffd9dc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
---

## Brand & Style

This design system is built to reflect the fast-paced, vibrant energy of modern Tanzanian urban centers like Dar es Salaam and Arusha. It balances a high-end, premium aesthetic with the welcoming warmth of African hospitality. 

The visual style is **Modern / Corporate**, prioritizing clarity and ease of use found in global leaders like Uber Eats, but infused with a localized color palette that feels native to the market. The interface utilizes generous white space to allow food photography to become the hero, while bold accent colors provide the necessary energy to drive action and signal speed.

## Colors

The palette is anchored by **Savanna Green**, symbolizing freshness and growth, and **Sunset Amber**, evoking the warmth of a hearth and the urgency of a "hot" meal. 

- **Primary Green (#0FA958):** Used for primary actions, brand moments, and success states.
- **Secondary Amber (#FFC107):** Used for highlighting promotions, star ratings, and secondary calls-to-action.
- **Surface White (#FFFFFF):** The primary canvas, ensuring the app feels clean and the food imagery looks uncompromised.
- **Text & Accents:** A deep charcoal (#1A1A1A) is used for high-contrast typography to ensure legibility under the bright Tanzanian sun.

## Typography

The design system utilizes **Plus Jakarta Sans** as its typographic backbone. This choice offers the geometric cleanliness of Poppins but with a slightly more refined and contemporary edge, perfect for a premium food delivery experience.

Headlines are set with tight line heights and bold weights to create a sense of urgency and importance. Body text is optimized for readability, ensuring that menu descriptions and restaurant details are easily digestible. Semantic hierarchy is strictly maintained to guide the user from discovery (Headlines) to decision (Body) to action (Labels).

## Layout & Spacing

This design system uses a **fluid grid model** optimized for mobile-first consumption. A standard 4-column grid is used for handheld devices, with 20px side margins to provide breathing room on high-resolution screens.

A strict **8px spacing rhythm** is applied throughout the UI. Elements are grouped using proximity; smaller gaps (8px-16px) relate content within a card, while larger gaps (24px-32px) separate distinct sections like "Recommended" and "Popular Near You."

## Elevation & Depth

To achieve a "premium" feel, this design system avoids heavy, dark shadows in favor of **Ambient Shadows** and **Tonal Layers**.

- **Level 1 (Surface):** Default background.
- **Level 2 (Cards):** Soft, extra-diffused shadows with a slight green tint (#0FA958 at 4% opacity) to create a subtle "lift" from the background.
- **Level 3 (Modals/Floating Buttons):** Higher blur radius (20px+) with low opacity (10%) to signal immediate interactivity and temporary state.
- **Depth:** Elements like the checkout bar or floating "Filters" button use backdrop blurs (15px) to maintain context while focusing the user's attention.

## Shapes

The defining characteristic of this design system's shape language is the **18px corner radius**. 

This specific curvature is applied to all primary containers, buttons, and restaurant cards. It strikes a perfect balance between professional (straight lines) and approachable (circles), making the interface feel modern and friendly. Small components like chips or tags use a fully rounded (pill) shape to distinguish them from actionable containers.

## Components

- **Buttons:** Primary buttons are high-contrast green (#0FA958) with white text and 18px corners. Secondary buttons use the amber accent or a ghost style with a 1.5px border.
- **Cards:** Restaurant and food cards use a white background with the Level 2 shadow. The 18px radius applies to the container and the top corners of the featured image.
- **Chips:** Used for cuisine types (e.g., "Swahili," "Italian"). These have a light gray or pale green background with `label-sm` typography.
- **Input Fields:** Clean, minimal outlines that turn Primary Green on focus. Error states are highlighted in red with a soft shake animation.
- **Bottom Sheets:** Used for food customization (add-ons). These feature a prominent drag handle and a blurred background overlay to focus on the selection process.
- **Progress Trackers:** High-visibility linear bars for the delivery journey, using the secondary amber to indicate the "moving" rider icon.