# TODO

## Fix 1: Navbar nav-links overflow
- [x] Change `justify-content: center` to `justify-content: flex-start` on `.nav-links`
- [x] Add `.nav-links::before/::after` auto-margin pseudo-elements so links stay centered when they fit, but scroll from the left (reachable) when they overflow — "Events" link no longer clipped

## Fix 2: Chatbot active dot clipped
- [x] Override global `button { overflow: hidden }` by setting `.chatbot-toggle { overflow: visible }`
- [x] Hide global button shine (`::after`) on the toggle so it doesn't spill outside the circle
- [x] Reposition `.chatbot-toggle-badge` inward (`top: 6px; right: 6px`) + add shadow & z-index so the active dot is fully visible
