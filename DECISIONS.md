# Decisions

The design and build decisions made for this filter bar, from November 17 to 20, 2026. Where a decision changed, the final choice comes first and the earlier one is noted below it.

## What it is

- **A search field plus a rubber segmented control.** The segment works like the React Bits "Rubber Segment" reference: the thumb stretches toward the new filter, then squashes into place. It's built from scratch for this project, not copied from React Bits.
- **The filters list states.** Each filter is a state an advisor works in.
- **An "All" filter comes first** and is selected when the page loads.
- **A reusable component, not a one-off.** The filters can be any values (states, event types, topics), and one Component can filter different collections on different pages.
- **You own the component and its behavior.** Design lives in Webflow classes you control. The code adds behavior only. Finsweet's List Load is the only outside piece, and only for lists with more than 100 items.
- **You build the cards and the grid.** This project supplies the bar and the behavior. The cards in `demo.html` are stand-ins for testing.

## Layout

### Search and filters
- **Search and filters share one bar, with no gap of page background between them.**
- **On desktop and every iPad, search never sits on its own line.** It shares the first line with as many filters as fit.
  - Earlier: search and the filters were separate rows on narrower screens. You ruled that out for desktop and iPad.
- **Filters that don't fit wrap to the next line, starting under the search field.**
  - Earlier: wrapped filters started under "All." You switched to under the search field.
- **An 8px gap separates each row** (search and filter lines).
- **On phones held upright (Webflow Mobile portrait), search gets its own line on top**, with the filters below.
- **iPads don't get the phone layout.** Search stays beside the filters there.
- **Breakpoints follow Webflow's own:** Desktop (992px and up), Tablet, Mobile landscape and Mobile portrait (478px and below). This keeps the iPad mini (744px) on the iPad layout.

### Filter sizing
- **Each filter is sized by its label plus padding, never a fixed width.** Fixed widths made "All" look bigger than the others.
- **Padding:** 8px top and bottom. Side padding is 48px on desktop, 24px on tablet and 4px on phones.
  - Earlier: 16px, then 24px on desktop. You asked for more padding to cut down empty space in the bar.
- **Filters keep their natural width**, so a short last line (like "Tennessee" alone) doesn't stretch across the bar.
- **A bar without search spreads its filters evenly** across the bar. The script adds the `is-spread` class for this automatically.
- **It's fine for filters to wrap** once there are 5 or more states.

### The bar
- **The bar is only as wide as it needs to be, centered, with a 700px minimum on desktop.**
  - Earlier: the bar was briefly full width on desktop and iPad. You then chose not to stretch it to the full 1440px unless needed.
- **It sits inside a 1440px max-width container** on the site. The max width is yours to set.
- **The search field is capped at 400px** on desktop and iPad, and starts at 240px. It grows only when its line has room.
- **The bar has padding on all sides** on every screen size.
- **The bar and the filter track are one element**, holding the background, padding, wrapping and row gap in one class.
  - Earlier: a bar with a separate track inside it.
- **The "Find an advisor" heading isn't needed.**

## Content and data

- **Your Advisors collection has:** a Home office reference, a Secondary offices multi-reference, and a States multi-reference.
- **Filters come from the states your advisors actually have**, not from the States collection, because that collection lists all 50 states.
- **Use full state names for now** ("Indiana"). You'll switch to two-letter codes ("IN") only if the list grows too long.
- **Screen readers get the full name** when a short code is used. `data-filter-name` supports this, ready for later.
- **Font sizes are set in Webflow**, not in the code.

## Pagination

- **About 12 cards per page, with filters covering every advisor**, not just the ones on the current page.
- **The component handles paging itself.** Webflow's own pagination only sends one page of cards, so the filters couldn't see the rest. Every card loads onto the page (Finsweet List Load past 100), and the component pages through the filtered results.
- **Disabled Previous and Next buttons stay at 100% opacity.**

## Advisor cards

- **Cards can show more than one location.** Secondary offices appear in the teal location bar.
- **Secondary locations use the same font size and weight** as the home office in that bar.
- **Every card in the grid stays the same height.** Extra lines (more offices, a wrapped name or title) come out of the photo, not the card's height.
- **Cards animate when the filter or page changes, with a subtle scale-up and bounce:** new cards go from 94% to 102% to 100% while fading in, staggered 40ms apart, and cards that stay glide to their new spot. Search typing doesn't animate, and reduced motion turns it off. (November 20, 2026)
- **Secondary offices keeps every branch, including two branches in the same city.** The CMS stays complete for profile pages.
- **A separate single reference, Secondary location, picks the one office shown on the card**, so "Bowling Green, KY" doesn't appear twice.
- **The script can also hide repeated cities on its own** (`data-filter-unique`), added as an option on November 20, 2026. It shows Secondary offices with each city once, without the extra field.

## Setup

- **Install the script at the page level for now, not site-wide.**
- **Keep page settings minimal** by putting the script in a Code Embed inside the filter's Component.
- **Remove unnecessary code** wherever possible.
- **Keep this work in a private GitHub repo** named "CMS Filters Rubber Segment."
- **The README needs full, step-by-step detail**, including Webflow-specific settings and anything easy to miss.

## Still open

These came up but weren't decided:

- **Secondary location or `data-filter-unique`:** keep the Secondary location field for the card, or show Secondary offices with repeats hidden and drop the extra field. The second avoids keeping two fields in sync, and handles advisors with more than one other city.
- **Secondary location shows on the canvas but not the published site:** check that the chosen branch and the advisor's item are both published, then republish.
- **Sticky bar:** with many cards, the bar scrolls out of view. It could stick to the top of the screen while scrolling.
- **Disabled pager buttons:** at full opacity they look the same as active ones. A different text color on `is-disabled` would show the difference.
- **Extra active-filter styling:** the active filter currently changes text color and background (through the thumb). Bold or an underline would need a small script change.
- **Loading the script from a public link:** the script could shrink to one line loaded from jsDelivr, but only if the repo were public.
- **The search field's place for screen readers:** it sits inside the filter group, so screen readers hear it as part of that group. Not yet tested with a real screen reader.
