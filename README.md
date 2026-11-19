# CMS Filters Rubber Segment

A reusable filter bar for Webflow: a search field and a rubber segmented control that filter any CMS Collection List. Use it for advisors by state, events by type, articles by topic, or anything else, on any page, as many times as you like.

You design every part in the Webflow Designer with your own classes. One script adds the behavior. It finds each bar through custom attributes, so no design values live in the code.

## What's in here

| File | What it is |
|---|---|
| `webflow/filter-bar.js` | The whole component. Paste it into Webflow, wrapped in a script tag. |
| `demo.html` | Two working bars with made-up sample data: 100 advisors across 8 states at 12 per page, and events by type. Its `<style>` block stands in for the classes you build in Webflow. |

## How it behaves

- **Options build themselves** from the values on your items, A to Z by default. "All" always comes first. When an item with a new value appears, its option appears too.
- **The thumb** stretches from the old option to the new one, then squashes into place. You can drag or flick it. With reduced motion turned on, it jumps with no animation.
- **Search** matches as you type, and works together with the options.
- **Pagination (optional):** filters every item first, then shows a page of matches, like 12 at a time, with Previous, Next and page numbers you design.
- **Keyboard:** Tab reaches the options, and the arrow keys, Home and End move between them.
- **Wrapping:** if the options wrap onto more lines, the thumb stretches between lines.
- **Late-loading items:** items added after the page loads (by Finsweet List Load, for example) are picked up and filtered automatically.
- **Equal card heights (optional):** extra wrapped lines come out of the card's photo instead of making the card taller.

## Build a bar

These steps get a bar working on one page. To use it across the whole site instead, see [Use it on the whole site](#use-it-on-the-whole-site).

Every attribute goes in **Element settings**, under **Custom attributes**. Where the value doesn't matter, use `true`.

### Step 1: Add the script

Pick one. You need a paid site plan for custom code. The script is about 20,000 characters, and each place below allows 50,000.

**Option A: a Code Embed in a Component (recommended)**

This keeps page settings empty, and the script travels with the bar wherever you use it.

1. Make a **Div Block** to hold the whole filter (bar, count and pager), and turn it into a **Component**.
2. Inside the Component, **beside the bar, not inside it**, add a **Code Embed**. Webflow wraps every Embed in its own div, and inside the bar that div would add an extra gap.
3. In the Embed, type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
4. Give the Embed a class set to **display: none**. The script still runs.

The Embed can sit above or below the bar. The script waits for the page to finish loading. Using the Component more than once on a page is fine, because the script runs only once.

**Option B: page settings**

1. In the **Pages** panel, hover over the page and click its **gear icon**.
2. Scroll to **Custom Code**.
3. In **Before `</body>` tag**, type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
4. Save.

Use the Before `</body>` field, not the head field. On a CMS template page, the script runs for every item that uses the template, and each page with a bar needs its own copy.

### Step 2: Build the bar

Pick a **group name** first, for example `advisors`. It ties a bar to its items, count and empty message, so two bars on one page never interfere.

**The bar**
1. Add a **Div Block** and give it your class. This is the outer background.
2. Add `data-filter-bar` = `advisors`.
3. Optional: add `data-filter-label` = `Filter advisors by state`. This is what screen readers announce.

**The options track**
1. Inside the bar, add a **Div Block** for the track.
2. Style it with your class. Its **padding** is the space between the thumb and the track's edge, and its flex and wrap settings decide how everything inside lays out.
3. Add `data-filter-options` = `true`.

Don't bind the track to the CMS. The script adds one option for each value you tag in [Step 4](#step-4-connect-your-items).

**The search field (optional)**
1. Inside the track, as its **first** child, add a **Form Block**. Filters then fill the rest of the search field's line, and any that don't fit wrap to the next line, starting under the search field.
2. Delete the submit button and the success and error messages.
3. Style the **Input** with your class.
4. On the Input, add `data-filter-search` = `true`. Pressing Enter won't submit the form.

**The "All" option**
1. Inside the track, after the search field, add a **Button** (or a Link Block or Div) and type **All**.
2. Style it as an **inactive** option: padding, font, idle text color and breakpoints. Every other option is copied from it.
3. Add `data-filter-option` = `true`.
4. If the label sits in a Text Block inside a Link Block, add `data-filter-option-label` = `true` to the Text Block.

**The thumb**
1. Inside the track, add an empty **Div Block**.
2. Style only its **background color**, **text color** (the active label color) and **corner radius**. The script handles its size, position and labels.
3. Add `data-filter-thumb` = `true`.

**Recommended layout**

These Style panel settings center the bar, keep it only as wide as it needs to be, keep search on the first line on every iPad and desktop, and start wrapped filters under the search field. They're what `demo.html` uses. The breakpoint names are Webflow's.

| Breakpoint | Element | Setting |
|---|---|---|
| Desktop (base) | Bar | Width: `fit-content`. Max width: 100%. Min width: 700px. Left and right margin: Auto. |
| Desktop (base) | Options track | Display: Flex, wrap, justify start, align center |
| Desktop (base) | Search Form Block | Flex child, Custom: grow `1000`, shrink `0`, basis `240px`. Width and max width: 400px. Right margin: 12px. |
| Desktop (base) | "All" option | Left and right padding: 48px. Flex child: none, so it keeps its natural width. |
| Desktop (base) | "All" option on a bar without search | Add a combo class, like `is-spread`, with flex grow `1`, so the options share the bar's width evenly |
| Tablet | Bar | Min width: None |
| Tablet | "All" option | Left and right padding: 24px |
| Mobile portrait | Bar | Width: Auto |
| Mobile portrait | Options track | Justify center |
| Mobile portrait | Search Form Block | Flex child basis: 100%. Width: Auto. Max width: None. Right margin: 0. Bottom margin: 8px. |
| Mobile portrait | "All" option (and `is-spread`) | Left and right padding: 4px. Flex grow `0`. |

Tablet settings carry down to Mobile landscape, so search stays on the first line on every iPad and on phones held sideways. Only Mobile portrait (478px and below) puts search on its own line. The search field starts at 240px and grows to 400px when its line has room.

### Step 3: Count and empty message (optional)

These can go anywhere on the page.

| Element | Attribute | What it does |
|---|---|---|
| Text Block for the count | `data-filter-status` = `advisors` | Shows the count, for example "3 advisors in Kentucky" |
| Same Text Block | `data-filter-noun` = `advisor` | The word for one item |
| Same Text Block (optional) | `data-filter-noun-plural` | The word for many, if it isn't the noun plus "s" |
| Any element for "no matches" | `data-filter-empty` = `advisors` | Shown only when nothing matches |

### Step 4: Connect your items

Your Collection List, grid and cards stay yours. Add these:

| Attribute | Goes on |
|---|---|
| `data-filter-item` = `advisors` | Each **Collection Item** (the grid's direct child, not the card inside it) |
| `data-filter-value` = `true` | Each value the item belongs to, like a state or category. For a multi-reference field, use a nested Collection List with a Text bound to Name. For an Option or text field, bind one Text. Hide them with display: none if they shouldn't show. |
| `data-filter-search-text` = `true` (optional) | Each text search should look at. Without it, search looks at all of the item's text. |
| `data-filter-name` (optional, for later) | Skip this while your values are full names. Use it only if you switch to short labels like "IN": add it to the same Text as `data-filter-value`, and bind the attribute's value to the CMS field with the full name, like "Indiana." Screen readers announce the full name, and the count reads "13 advisors in Indiana." |

Let the grid place items automatically. If you pin items to specific cells, hidden items leave holes.

### Step 5: Pagination (optional)

The bar filters every item first, then shows one page of the matches. A filter or search change goes back to page 1, and the page numbers always match the filtered results.

**Use this instead of Webflow's own pagination.** Webflow's "Paginate items" sends only one page of cards to the browser, so the filter could only see those. Keep every item on the page: turn pagination off on the Collection List (up to 100 items), or use [Finsweet List Load](#more-than-100-items-finsweet-list-load) past 100.

1. Below your grid, add a **Div Block** (or a Nav) for the pager and give it your class.
2. Add `data-filter-pagination` = `advisors` and `data-filter-page-size` = `12`.
3. Inside it, add a **Button** for Previous with `data-filter-prev` = `true`, and one for Next with `data-filter-next` = `true`.
4. Between them, add a **Div Block** for the page numbers with `data-filter-pages` = `true`.
5. Inside that, add one **Button** and type **1**. Give it `data-filter-page` = `true`. Every page number is copied from it.
6. Optional: add a **Text Block** with "…" and `data-filter-page-gap` = `true`. With more than 7 pages, the pager shows the first page, the last page and the pages next to the current one, with "…" between them. Without it, every page number shows.

**States you style in Webflow:** the current page gets the class `is-current`, and Previous or Next gets `is-disabled` at either end. Create them as combo classes on your page button and Previous and Next buttons, and style them. To use other names, add `data-filter-current-class` or `data-filter-disabled-class` to the pager.

- The pager hides itself when everything fits on one page.
- Optional: a Text Block with `data-filter-range` = `advisors` shows "Showing 13 to 24 of 100."
- Changing pages scrolls back to the bar when it's above the screen. If you have a sticky header, give the bar a top **scroll margin** so the header doesn't cover it.

### Step 6: Optional settings on the bar

Add these to the bar element:

| Attribute | What it does | Default |
|---|---|---|
| `data-filter-sort` = `cms` | Keeps the order values first appear in your list | A to Z |
| `data-filter-duration` | Thumb animation length in ms. `0` turns the animation off. | `420` |
| `data-filter-squash` | How far the thumb overshoots before settling, in px | `3` |
| `data-filter-field` | A field name, like `state`, for [two bars on one list](#two-bars-on-one-list) | All `data-filter-value` text |

**Focus ring:** on the bar's class, add the custom properties `--filter-focus` (color) and `--filter-focus-offset`. Without them, it uses the current text color, 2px out.

### Step 7: Publish and test

Publish to your **webflow.io staging** domain, since custom code doesn't run in the Designer or Preview mode. Then check:

- [ ] The options show All, then your values.
- [ ] Tapping or dragging moves the thumb and filters the items.
- [ ] Search filters as you type, and Enter doesn't reload the page.
- [ ] The count updates, and the empty message shows only when nothing matches.
- [ ] Tab and the arrow keys move between the options.
- [ ] Previous, Next and the page numbers change pages, and a new filter goes back to page 1.
- [ ] Each page shows no more than your page size, and the pager hides when everything fits on one page.
- [ ] With Reduce Motion on, the thumb jumps with no animation.
- [ ] The layout holds at 320px, 768px and desktop.

## Use it on the whole site

Instead of Step 1, paste the script once for every page:

1. Open **Site settings**, then **Custom code**, then **Footer code**.
2. Type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
3. Save and publish.

On pages with no filter bar, it does nothing. Steps 2 to 7 stay the same on each page with a bar.

**Moving to the whole site later:** add it to Site settings, then delete it from the Component's Embed or from each page. Leaving both won't break anything, because the script runs only once per page, but the extra copy adds to the page's size.

## Two bars on one list

To filter one list two ways, like advisors by state and by service, give both bars the same group name and different fields:

- Bar 1: `data-filter-bar="advisors"` and `data-filter-field="state"`
- Bar 2: `data-filter-bar="advisors"` and `data-filter-field="service"`
- On items: `data-filter-value="state"` on state names, and `data-filter-value="service"` on service names

Items show only when they match both bars.

## Equal card heights (optional)

| Attribute | Goes on |
|---|---|
| `data-fit-photo` | The photo wrapper. This gives up space. |
| `data-fit-text` | Any text that may wrap, like the name and title |
| `data-fit-grow` | An area that grows with extra lines, like a location bar |
| `data-fit-base` | The first line inside that area, like the home office |

Give everything after the photo a background color, and keep the photo wrapper in normal flow (not absolutely positioned).

## More than 100 items: Finsweet List Load

A Collection List shows at most 100 items per page, and the filter only sees items on the page. If a list outgrows that, use Finsweet's List Load to bring in every page. It's the only Finsweet piece you need. The filter bar doesn't depend on it, and it picks up the loaded items on its own.

1. In **Site settings**, then **Custom code**, then **Head code**, add:
   `<script async type="module" src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js" fs-list></script>`
2. On the **Collection List**, add `fs-list-element` = `list` and `fs-list-load` = `all`.
3. Turn on **Paginate items** in the Collection List settings. List Load needs Webflow's pagination to find the other pages. Set it to 100 items per page, so List Load makes fewer requests. The filter bar's own pager decides how many cards people see.
4. Set the pagination element to **display: none**.

Check that nested Collection Lists (like states inside each item) come through on the loaded items. Finsweet's List Load page doesn't cover nested lists.

## Troubleshooting

| What you see | Likely cause |
|---|---|
| Nothing happens | The script isn't in a Code Embed, the page's Before `</body>` field or Footer code, it's missing its script tags, or you're in Preview mode. Custom code only runs on the published site. |
| Only "All" shows | Items have no `data-filter-value`, or the bar and items use different group names |
| Filters miss cards on other pages | Webflow's "Paginate items" is on without Finsweet List Load. Use the bar's own pager instead (Step 5). |
| The thumb is missing | The track needs a `data-filter-thumb` element. The browser console names the bar. |
| The active label is the wrong color | Set the text color on the thumb, not on the option |
| Search sits on its own line on a tablet or desktop | The search Form Block is outside the options track, or its Mobile portrait settings were set on a larger breakpoint. Move it inside the track as the first child, and keep the full-width settings on Mobile portrait only. |
| An extra gap inside the bar | The Code Embed sits inside the bar. Move it beside the bar. |
| Empty gaps in the grid | `data-filter-item` is on the card instead of the Collection Item, or items are pinned to grid cells |
| Enter reloads the page | The Input isn't the one with `data-filter-search` |

## Known limits

- The count reads "in" before the active option (for example "in Kentucky"). Change that word in the script if it reads oddly for another list.
- The filter doesn't change the URL, so you can't share a link to a filtered view.
- There's no limit on how much of a photo equal heights can cover.
