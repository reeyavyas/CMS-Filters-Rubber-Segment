# CMS Filters Rubber Segment

A reusable filter bar for Webflow: a search field and a rubber segmented control that filter any CMS Collection List. Use it for advisors by state, events by type, articles by topic, or anything else, on any page, as many times as you like.

You design every part in the Webflow Designer with your own classes. One site-wide script adds the behavior. It finds each bar through custom attributes, so no design values live in the code.

## What's in here

| File | What it is |
|---|---|
| `webflow/filter-bar.js` | The whole component. Paste it once into Site settings, wrapped in a script tag. |
| `demo.html` | Two working bars (advisors by state, and events by type) with made-up sample data. Its `<style>` block stands in for the classes you build in Webflow. |

## How it behaves

- **Options build themselves** from the values on your items, A to Z by default. "All" always comes first. When an item with a new value appears, its option appears too.
- **The thumb** stretches from the old option to the new one, then squashes into place. You can drag or flick it. With reduced motion turned on, it jumps with no animation.
- **Search** matches as you type, and works together with the options.
- **Keyboard:** Tab reaches the options, and the arrow keys, Home and End move between them.
- **Wrapping:** if the options wrap onto more lines, the thumb stretches between lines.
- **Late-loading items:** items added after the page loads (by Finsweet List Load, for example) are picked up and filtered automatically.
- **Equal card heights (optional):** extra wrapped lines come out of the card's photo instead of making the card taller.

## Install

Pick one place. The script is about 15,000 characters, and both fields allow 50,000.

### One page

1. In the **Pages** panel, hover over the page and click its **gear icon**.
2. Scroll to **Custom Code**.
3. In **Before `</body>` tag**, type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
4. Save and publish.

Use "Before `</body>` tag," not "Inside `<head>` tag," because the bar and items need to be on the page when the script runs. On a CMS template page, it runs for every item that uses the template. Each page with a bar needs its own copy.

### The whole site

1. Open **Site settings**, then **Custom code**, then **Footer code**.
2. Type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
3. Save and publish.

On pages with no filter bar, it does nothing.

**Moving from page to site later:** add it to Site settings, then delete it from each page. Leaving both won't break anything, because the script skips a bar it has already set up, but it would load twice.

## Build a bar in the Designer

Every custom attribute below goes in **Element settings**, under **Custom attributes**. Where the value doesn't matter, use `true`.

Each bar has a **group name**, like `advisors` or `events`. The group name ties a bar to its items, its count and its empty message, so two bars on one page never interfere.

### 1. The bar

Add a **Div Block** and style it however you like. This is your bar.

| Attribute | Value |
|---|---|
| `data-filter-bar` | The group name, for example `advisors` |
| `data-filter-label` (optional) | What screen readers announce, for example `Filter advisors by state` |

### 2. The search field (optional)

Inside the bar, add a **Form Block** and style its **Input**. Delete the form's submit button. Pressing Enter won't submit the form.

| Attribute | Goes on |
|---|---|
| `data-filter-search` | The Input |

### 3. The options track

Inside the bar, add a **Div Block** for the track the options sit in. Its padding sets the gap between the thumb and the track's edge.

| Attribute | Goes on |
|---|---|
| `data-filter-options` | The track |

### 4. The "All" option

Inside the track, add a **Button** (or a Link Block or Div) and type **All**. This is the template every other option is copied from, so style it as an inactive option: padding, font, idle text color, and any breakpoint changes.

| Attribute | Goes on |
|---|---|
| `data-filter-option` | The All option |
| `data-filter-option-label` (optional) | A Text Block inside the option, if the label sits inside a Link Block |

### 5. The thumb

Inside the track, add an empty **Div Block**. Give it the thumb's look: **background color**, **text color** (the active label color) and **corner radius**. The script handles its size, position and layout.

| Attribute | Goes on |
|---|---|
| `data-filter-thumb` | The thumb |

### 6. The count and empty message (optional)

These can sit anywhere on the page.

| Attribute | Goes on | What it does |
|---|---|---|
| `data-filter-status` = group name | A Text Block | Shows the count, for example "3 advisors in Kentucky" |
| `data-filter-noun` | Same Text Block | The word for one item, for example `advisor` |
| `data-filter-noun-plural` (optional) | Same Text Block | The word for many, if it isn't the noun plus "s" |
| `data-filter-empty` = group name | Any element | Shown only when nothing matches |

## Tag your items

Your Collection List, grid and cards stay yours. Add these:

| Attribute | Goes on |
|---|---|
| `data-filter-item` = group name | Each **Collection Item** (the grid's direct child, not the card inside it) |
| `data-filter-value` | Each value the item belongs to, like a state or category. For a multi-reference field, use a nested Collection List with a Text bound to the Name. For an Option or text field, bind one Text. Hide them with display: none if they shouldn't show. |
| `data-filter-search-text` (optional) | Each text search should look at. With none, search looks at all the item's text. |

Let the grid place items automatically. If you pin items to specific cells, hidden items leave holes.

## Options for each bar

Add these to the bar element:

| Attribute | Value | Default |
|---|---|---|
| `data-filter-sort` | `cms` keeps the order values first appear in your list | A to Z |
| `data-filter-field` | A field name, like `state`, when one group has two bars (see below) | All `data-filter-value` text |
| `data-filter-duration` | Thumb animation length in milliseconds. `0` turns the animation off. | `420` |
| `data-filter-squash` | How far the thumb overshoots before settling, in px | `3` |

**Focus ring:** set `--filter-focus` (color) and `--filter-focus-offset` on the bar's class with a custom property, or keep the defaults: the current text color, 2px out.

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
3. Turn on **Paginate items** in the Collection List settings. List Load needs Webflow's pagination to find the other pages.
4. Set the pagination element to **display: none**.

Check that nested Collection Lists (like states inside each item) come through on the loaded items. Finsweet's List Load page doesn't cover nested lists.

## Troubleshooting

| What you see | Likely cause |
|---|---|
| Nothing happens | The script isn't in Footer code or the page's Before `</body>` field, it's missing its script tags, or you're in Preview mode. Custom code only runs on the published site. |
| Only "All" shows | Items have no `data-filter-value`, or the bar and items use different group names |
| The thumb is missing | The track needs a `data-filter-thumb` element. The browser console names the bar. |
| The active label is the wrong color | Set the text color on the thumb, not on the option |
| Empty gaps in the grid | `data-filter-item` is on the card instead of the Collection Item, or items are pinned to grid cells |
| Enter reloads the page | The Input isn't the one with `data-filter-search` |

## Known limits

- The count reads "in" before the active option (for example "in Kentucky"). Change that word in the script if it reads oddly for another list.
- The filter doesn't change the URL, so you can't share a link to a filtered view.
- There's no limit on how much of a photo equal heights can cover.
