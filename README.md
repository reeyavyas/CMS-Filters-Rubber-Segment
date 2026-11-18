# CMS Filters Rubber Segment

A search field and a rubber segmented control that filter a Webflow CMS Collection List of advisors by state. The filters show only the states your advisors actually have, A to Z, and "All" always sits first.

Tap a state and the white thumb stretches across to it, then squashes into place. You can also drag or flick it. When you turn on reduced motion, it jumps with no animation.

## What's in here

| File | What it is |
|---|---|
| `webflow/1-controls-embed.html` | The search field, the segment, the results count and the empty message, with their CSS. Paste it into a Code Embed. |
| `webflow/2-page-script.html` | The motion, filtering and equal-card-height script. Paste it into Page Settings, Before `</body>` tag. |
| `advisor-filter.html` | A standalone prototype with made-up advisors. Open it in a browser to try everything without Webflow. |

The people and phone numbers in the prototype are fictional (555-01xx numbers).

## How it behaves

- **Search** matches names, titles and office cities as you type, and works together with the state filter.
- **Filters** size to their label plus padding: 8px top and bottom, 24px left and right on iPad, and 48px left and right on desktop (wider than 1024px). On phones, each line splits its space evenly between the filters.
- **Wrapping:** when there are too many states to fit, the filters wrap onto another line, and the thumb stretches between lines.
- **Keyboard:** Tab reaches the segment, and the arrow keys, Home and End move between filters.
- **Layout:** on desktop and iPad, the bar runs full width, with search on the left (capped at 400px) and filters on the right. Below 720px, search sits on top and the filters sit underneath.
- **Equal card heights:** when a card has secondary offices or a wrapped name or title, the card body moves up over the bottom of the photo, so every card stays the same height.

## Webflow setup

You need a paid site plan for Code Embeds and page custom code. Every custom attribute below uses the value `true`.

### 1. CMS

- **Advisors collection:** has Home office (reference), Secondary offices (multi-reference) and a States field. The States field can be a multi-reference to a States collection (even one with all 50 states) or an Option field. Only states that at least one advisor has become filters.

### 2. The bar

1. Add a **Code Embed** above the advisor Collection List.
2. Paste in `webflow/1-controls-embed.html`.

### 3. Tag each advisor card

| Attribute | Goes on |
|---|---|
| `data-advisor` | The Collection Item itself, not the card inside it |
| `data-search` | Name, title, home office text and secondary office text |
| `data-card-fit` | Name and title text |
| `data-card-photo` | Photo wrapper |
| `data-card-footer` | Teal bar |
| `data-card-home` | Home office text inside the teal bar |

Also give the card body (the section under the photo) a background color, because it moves up over the photo.

### 4. Secondary offices in the teal bar

1. Inside the teal bar, add a **Collection List** with **Secondary offices** as its source.
2. Bind a text element to the office city, and give it the same class as the home office text.
3. Set the nested list's **Empty State** to **display: none**.

### 5. Each advisor's states (hidden)

These do two jobs: they decide which filters appear, and which cards each filter shows.

- **Multi-reference States field:** inside the Collection Item, add a **Collection List** with **States** as its source. Bind a text element to **Name**, give it the attribute `data-state`, and give the list wrapper a class set to **display: none**.
- **Option field:** inside the Collection Item, add one text element bound to the States field, with the attribute `data-state`, and hide it with **display: none**.

### 6. Script

Paste `webflow/2-page-script.html` into **Pages**, then the page's gear icon, then **Custom Code**, then **Before `</body>` tag**.

### 7. Collection List settings

Turn off pagination on the advisor list. The filter only sees cards that are on the page, and a Collection List shows at most 100 items. A state whose advisors are all on another page won't get a filter.

### 8. Publish and test

Custom code doesn't run in the Designer or Preview mode, so publish to your webflow.io staging domain and test there.

## Customizing

At the top of the embed, the `.af` block holds the colors, radius, height, inset and search cap. Replace the placeholder colors with your brand values, then check contrast again.

The thumb reads its position and corner radius from the page, so you can change `--af-radius` and `--af-inset` without touching the script.

## Using your own grid and cards

The embed only builds the bar: search, filters, results count and the empty message. Your grid and cards stay yours. The script never adds classes or layout styles to them. It only does three things to your elements:

1. **Hides filtered-out cards** by adding the `hidden` attribute to each `data-advisor` element. The embed includes a rule that hides it even when your own class sets a display value (flex, grid or block).
2. **Sets one variable, `--extra`,** on each `data-advisor` element. The embed uses it to pull the photo up under the card body, so cards stay the same height.
3. **Reads text** from your `data-search` and `data-state` elements. The `data-state` text also decides which filters appear.

For it to work with your grid:

- Use a Collection List for the cards, and put `data-advisor` on the **Collection Item** (the grid's direct child).
- Let the grid place items automatically. If you pin items to specific cells, hidden cards leave holes.
- Give the card body (everything after the photo) a background color.
- Leave the photo wrapper in normal flow, not absolutely positioned, so its bottom margin can pull the body up.
- Skip the four `data-card-*` attributes if you don't want equal heights. Filtering and search work without them.

## Troubleshooting

| What you see | Likely cause |
|---|---|
| Nothing filters | The script isn't in Before `</body>`, or you're testing in Preview mode |
| Only "All" shows | The cards have no `data-state` text, or it sits outside the `data-advisor` element |
| A state shows nobody | The state Name in the CMS doesn't match exactly |
| Empty gaps where cards were | `data-advisor` is on the card instead of the Collection Item |
| Photo shows through the card body | The card body has no background color |
| Cards are uneven | `data-card-fit`, `data-card-footer` or `data-card-home` is missing |

## Known limits

- Each advisor card uses two nested Collection Lists, so check Webflow's current limits on nested lists.
- There's no limit on how much of the photo gets covered, so an advisor with many offices loses more of it.
- The filter doesn't change the URL, so you can't share a link to a filtered view.
