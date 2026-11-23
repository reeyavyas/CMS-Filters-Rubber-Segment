# CMS Filters Rubber Segment

A reusable filter bar for Webflow: a search field and a rubber segmented control that filter any CMS Collection List. Use it for advisors by state, events by type, articles by topic, or anything else, on any page, as many times as you like.

You design every part in the Webflow Designer with your own classes. One script adds the behavior. It finds each bar through custom attributes, so no design values live in the code.

## What's in here

| File | What it is |
|---|---|
| `webflow/filter-bar.js` | The whole component. Paste it into Webflow, wrapped in a script tag. |
| `demo.html` | Two working bars with made-up sample data: 100 advisors across 8 states at 12 per page, and events by type. Its `<style>` block stands in for the classes you build in Webflow. |
| `DECISIONS.md` | The design and build decisions behind this component, and what's still open. |

## How it behaves

- **Any collection, any number of times:** one Component can filter advisors, events, articles or anything else, each instance pulling from its own Collection List. See [Use it with other collections](#use-it-with-other-collections).
- **Options build themselves** from the values on your items, A to Z by default. "All" always comes first. When an item with a new value appears, its option appears too.
- **The thumb** stretches from the old option to the new one, then squashes into place. You can drag or flick it. With reduced motion turned on, it jumps with no animation.
- **Search** matches as you type, and works together with the options.
- **Card motion:** when someone picks a filter or changes pages, new cards scale up with a small bounce and fade in one after another, cards that stay glide to their new spot, and cards that don't move bounce in place. Typing in search stays instant.
- **Pagination (optional):** filters every item first, then shows a page of matches, like 12 at a time, with Previous, Next and page numbers you design.
- **Keyboard:** Tab reaches the options, and the arrow keys, Home and End move between them.
- **Wrapping:** if the options wrap onto more lines, the thumb stretches between lines.
- **Late-loading items:** items added after the page loads (by Finsweet List Load, for example) are picked up and filtered automatically.
- **Equal card heights (optional):** extra wrapped lines come out of the card's photo instead of making the card taller.
- **Repeated values hidden (optional):** a list can show a repeated city, like two branches in Bowling Green, only once.

## Build a bar

These steps build one bar for the advisors list. Everything you see is a normal Webflow element with your own class. The script only adds behavior. Where a step names a class, like `filter-bar`, use that name or your own.

### What you'll end up with

This is the finished structure in the **Navigator** panel. Indents show what sits inside what.

```
Filter (Component)                  filter-wrapper
├─ Code Embed (the script)          hidden           (display: none)   ← first, above the bar
├─ Bar                              filter-bar       data-filter-bar = advisors
│                                                    data-filter-options = true
│  ├─ Search Form Block             filter-search
│  │  └─ Input                      filter-input     data-filter-search = true
│  ├─ "All" option (Button)         filter-option    data-filter-option = true
│  └─ Thumb (empty Div Block)       filter-thumb     data-filter-thumb = true
├─ Count text                       filter-status    data-filter-status = advisors
└─ Empty message                    filter-empty     data-filter-empty = advisors

Advisors Collection List            your grid        (Step 5)
└─ Collection Item                                   data-filter-item = advisors
   └─ your card …                                    data-filter-value on the state names

Pager (optional)                    pager            data-filter-pagination = advisors   (Step 6)
```

### How to add a custom attribute

You'll do this for most elements, so here it is once:

1. Select the element on the canvas or in the Navigator.
2. Open the **Element settings** panel (the gear icon in the right sidebar, or press **D**).
3. Scroll to **Custom attributes** and click **+**.
4. Type the **Name** (for example `data-filter-bar`) and the **Value** (for example `advisors`).
5. Click **Save**.

Where a value doesn't matter, type `true`.

### Step 1: Add the script

Pick one option. You need a paid site plan for custom code. The script is about 20,000 characters, and each place below allows 50,000.

**Option A: a Code Embed in a Component (recommended)**

The script then travels with the bar, and page settings stay empty.

1. Add a **Div Block** to the page where the bar should go. Give it the class `filter-wrapper`. You'll put the bar, count and empty message inside it in the next steps.
2. From the **Add** panel, drag a **Code Embed** inside `filter-wrapper` as its **first child, above where the bar will go**. Not inside the bar: Webflow wraps every Embed in its own div, and inside the bar that div would add an extra gap.
3. In the code window, type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`. Click **Save & Close**.
4. Give the Embed the class `hidden` and set **Display: None** in the Style panel. The script still runs.
5. When Steps 2 to 4 are done, right-click `filter-wrapper` and choose **Create component**, so you can reuse the whole filter on other pages. To use it with other collections, set up the Component's properties next (see [Use it with other collections](#use-it-with-other-collections)).

**The Embed must come before the bar, the empty message and the cards.** The script adds a little CSS the moment it loads: it keeps the thumb hidden until it's placed, and keeps the empty message hidden unless nothing matches. If the Embed sits below them, the browser draws them first, and you see a white bar and the empty message flash on page load. The script itself waits for the page to finish loading before it builds the filters, and it runs only once even if the Component appears twice on a page.

**Option B: page settings**

1. In the **Pages** panel, hover over the page and click its **gear icon**.
2. Scroll to **Custom Code**.
3. In **Inside `<head>` tag**, type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
4. Click **Save**.

Use the **head** field, not Before `</body>`. In the head, the script's CSS is ready before the bar draws, so there's no white bar or empty-message flash on page load. The script waits for the page to finish loading before it builds the filters, so the head is safe. On a CMS template page, the script runs for every item that uses the template. Each page with a bar needs its own copy.

### Step 2: Build the bar

Pick a **group name** first. These steps use `advisors`. The group name ties the bar to its items, count, empty message and pager, so two bars on one page never interfere.

Build each element at the **Desktop** breakpoint first (the base, with the desktop icon selected at the top of the canvas). Then make the Tablet and Mobile portrait changes listed under each element. Webflow carries a breakpoint's settings down to the smaller ones, so Tablet settings also apply to Mobile landscape.

#### 2a. The bar

One element is the bar's background and also the track that holds the search field, the filters and the thumb. It decides how they wrap.

1. Inside `filter-wrapper`, add a **Div Block**. Give it the class `filter-bar`.
2. Add the attribute `data-filter-bar` = `advisors`.
3. Add the attribute `data-filter-options` = `true`. This tells the script the filters live directly inside the bar.
4. Optional: add `data-filter-label` = `Filter advisors by state`. Screen readers announce this as the name of the filter group.
5. Style it:

| Breakpoint | Style panel settings |
|---|---|
| Desktop | **Layout:** Display Flex, Direction Horizontal, Align Center, Justify Start, **Wrap children** on, row gap `8px`. **Size:** Width `fit-content`, Min W `700px`, Max W `100%`. **Spacing:** padding 11px on all sides, margin left and right Auto. **Backgrounds:** your bar color. **Borders:** your corner radius. |
| Tablet | **Size:** Min W None |
| Mobile portrait | **Layout:** Justify Center. **Size:** Width Auto. |

- **Padding** is the space between the bar's edge and everything inside it, including the thumb. 11px matches the look of the demo (it was 8px on the old outer bar plus 3px on the old track). Use your own spacing value.
- **Row gap** is the space between lines of filters, and between the search field and the filters on phones.
- **`fit-content`** keeps the bar only as wide as it needs to be, and Auto margins center it. Type `fit-content` straight into the Width field. If your Webflow version won't accept it, leave Width on Auto; the bar then fills its container.

Don't bind the bar to the CMS or add a filter for each state. The script adds one filter for each value you tag on your items in [Step 5](#step-5-connect-your-items).

#### 2b. The search field (optional)

Putting the search field **inside the bar, as its first child**, lets the filters fill the rest of its line. Filters that don't fit wrap to the next line, starting under the search field.

1. From the **Add** panel, drag a **Form Block** inside the bar, above everything else in it. Give the form the class `filter-search`.
2. Inside the Form Block, delete the **Submit button**, the **Success message** and the **Error message**. If it has a **Field label**, delete that too.
3. Select the **Input**. In Element settings, set **Type** to Plain, clear its **Name** if you like, and type a **Placeholder**, like "Search by name or city."
4. On the Input, add the attribute `data-filter-search` = `true`. Pressing Enter won't submit the form.
5. Also on the Input, add `aria-label` = `Search advisors`, so screen readers know what the field does without a visible label.
6. Give the Input the class `filter-input` and style how it looks: height (38px matches the filters), padding, background, text color, placeholder color and corner radius.
7. Style the Form Block:

| Breakpoint | Style panel settings |
|---|---|
| Desktop | **Layout (Flex Child):** Custom, Grow `1000`, Shrink `0`, Basis `240px`. **Size:** Width `400px`, Max W `400px`. **Spacing:** margin right 12px, all other margins 0. |
| Mobile portrait | **Layout (Flex Child):** Basis `100%`. **Size:** Width Auto, Max W None. **Spacing:** margin right 0. |

The search field starts at 240px wide. If its line has room left after the filters, it grows first, up to 400px. On Mobile portrait it takes a full line of its own, and the row gap spaces it from the filters.

Optional: to show a magnifying glass, place your icon inside the Form Block, set it to **Position: Absolute**, about 12px from the left and centered vertically, and give the Input enough left padding (about 40px) so the text clears it.

#### 2c. The "All" option

This is the only filter you build. It's the template the script copies for every state, so **style it as an inactive filter**.

1. Inside the bar, after the search field, add a **Button**. Change its text to **All**.

   Use the **Button** element from the **Add** panel (in the Basic section), which is a link. **Don't use a form's Submit button**, and don't put the "All" option inside the search Form Block. A submit button belongs to a form and would try to send it.
2. Give it the class `filter-option`.
3. Add the attribute `data-filter-option` = `true`.
4. Style it:

| Breakpoint | Style panel settings |
|---|---|
| Desktop | **Layout:** Display Grid (or Flex), centered. **Spacing:** padding 8px top and bottom, 48px left and right. **Typography:** your font, weight and size, line height 22px, **Color: your inactive text color**, no wrap. **Backgrounds:** none. **Layout (Flex Child):** Don't shrink or grow. |
| Tablet | **Spacing:** padding 24px left and right |
| Mobile portrait | **Spacing:** padding 4px left and right |

Leave the Button's link as it is. The script stops it from jumping the page.

If you use a **Link Block** with a Text Block inside instead of a Button, put `data-filter-option-label` = `true` on the Text Block, so the script knows where to write each state's name.

**For a bar without a search field:** the script adds the combo class `is-spread` to the "All" option (and so to every filter) whenever the bar has no search field. Style it once so the filters share the bar's width evenly:
1. Select the "All" option, type `is-spread` in the selector to add it as a combo class.
2. Set its **Flex Child** to Grow `1` on Desktop, and back to Don't shrink or grow on Mobile portrait.
3. Remove `is-spread` from the "All" option again if this bar has a search field. The script adds it only where it's needed.

Like `is-current`, no element may carry `is-spread` in the Designer, so Webflow's **Clean up** would delete it. Skip Clean up for it, or keep a hidden style-guide element that uses it.

#### 2d. The thumb

The thumb is the white (or any color) shape that slides behind the active filter.

1. Inside the bar, add a **Div Block** as the **last** child, after the "All" option. Leave it empty.
2. Give it the class `filter-thumb`.
3. Add the attribute `data-filter-thumb` = `true`.
4. Style only three things:
   - **Backgrounds:** the active filter's background color.
   - **Typography:** Color set to **the active filter's text color**. This is the "text color change" (see Step 3).
   - **Borders:** the active filter's corner radius. The demo uses 7px inside a 10px bar.

Don't set its size, position, padding or display. The script makes it cover the bar, places a copy of every filter label inside it, and clips it to the active filter.

**In the Designer, the thumb looks empty or invisible.** That's expected. Custom code doesn't run in the Designer, so you'll only see "All" in the bar, with no thumb behind it. Everything appears on the published site.

### Step 3: Set the inactive and active colors

Two elements decide the filters' colors. You don't need an "active" class or an Interaction.

| State | What changes | Where you set it |
|---|---|---|
| Inactive filters | Text color | The **"All" option's** class (`filter-option`), Typography Color |
| Active filter | Text color | The **thumb's** class (`filter-thumb`), Typography Color |
| Active filter | Background color | The **thumb's** class, Backgrounds Color |
| Active filter | Corner radius | The **thumb's** class, Borders Radius |

How it works: the thumb holds a copy of every filter label, and those copies take the thumb's text color. The thumb shows only behind the active filter, so that filter's label appears in your active color while the others keep their inactive color. When someone picks another filter, the thumb slides over, and the new filter's label changes color with it.

**Check the contrast** of both pairs: your inactive text color on the bar's background, and your active text color on the thumb's background.

The bounce needs nothing from you either. Don't add Webflow Interactions to the thumb or the filters. The script already moves the thumb, and an Interaction would fight with it.

### Step 4: Count and empty message (optional)

Both can go anywhere on the page. Inside `filter-wrapper`, under the bar, is a good spot.

**The count**
1. Add a **Text Block** with the class `filter-status`. Leave its text empty, or type a placeholder. The script replaces it.
2. Add `data-filter-status` = `advisors`.
3. Add `data-filter-noun` = `advisor`. It shows as "13 advisors in Indiana."
4. Optional: add `data-filter-noun-plural` if the plural isn't the noun plus "s," like `people` for `person`.

**The empty message**
1. Add a **Text Block** (or any element) with the class `filter-empty`. Type what people see when nothing matches, like "No advisors match. Try a different name, city or state."
2. Add `data-filter-empty` = `advisors`. On the published site it stays hidden from the moment the page loads, and shows only when nothing matches. In the Designer it stays visible, so you can style it.

### Step 5: Connect your items

Your Collection List, grid and cards stay exactly as you design them. You only add attributes.

**The list**
1. Select your advisors **Collection List**. In its settings, make sure **pagination is off** and no item limit cuts advisors off. The filter only sees cards that are on the page (see Step 6 for paging).
2. Let your grid place items automatically. If you pin items to specific grid cells, hidden cards leave holes.

**Each item**
1. Select the **Collection Item** (the grid's direct child, not the card inside it).
2. Add `data-filter-item` = `advisors`. The script hides and shows this element.

**The states each advisor belongs to**
1. Inside the Collection Item, add a **Collection List** and set its source to the advisor's **States** field (the multi-reference).
2. Inside it, add a **Text Block** and bind it to the state's **Name**.
3. On that Text Block, add `data-filter-value` = `true`.
4. Give the nested list's wrapper a class with **Display: None**, so the names don't show on the card.
5. If your states are an Option field instead of a multi-reference, add one Text Block bound to that field, with `data-filter-value` = `true`, and hide it.

Webflow limits how many nested Collection Lists a page can have, and how many items each nested list shows. Each advisor card already uses nested lists (states, and secondary offices if you show them), so check Webflow's current limits against your largest advisor.

**What search looks at (optional)**
1. On each text search should match, like the name, title, home office and secondary office cities, add `data-filter-search-text` = `true`.
2. Without any of these, search looks at all of the item's text.

**Hide repeated cities (optional)**
When an advisor works at two branches in the same city, a Secondary offices list bound to the city shows it twice, like "Bowling Green, KY" and "Bowling Green, KY." The script can show it once, while your CMS keeps both branches.
1. Inside the Collection Item, select the nested **Collection List** for Secondary offices (the element that holds the Collection Items, or its wrapper).
2. Add `data-filter-unique` = `true`.
3. Publish. In each card's list, any item whose text matches an earlier one is hidden. Capitals and extra spaces don't count as differences, so "Bowling Green, KY" and "bowling green, ky" are the same.

- Different cities all stay visible. Only exact repeats are hidden.
- The CMS and your profile pages are unchanged. Both branches stay linked, so a profile page can still list each branch's address.
- Hidden repeats don't count toward equal card heights, so the card doesn't get taller for them.
- Search still finds the advisor by that city.
- It works on any list, not just offices. On a list that isn't a Collection List, the element's direct children are compared instead.
- With this on, you don't need a separate single-reference field (like Secondary location) just to avoid the repeat.

**Short labels (optional, for later)**
If you switch to short labels like "IN," add `data-filter-name` to the same Text Block as `data-filter-value`, and bind the attribute's value to the CMS field with the full name, like "Indiana." Screen readers then announce "Indiana," and the count reads "13 advisors in Indiana." Skip this while your values are full names.

### Step 6: Pagination (optional)

The bar filters every item first, then shows one page of the matches. A filter or search change goes back to page 1, and the page numbers always match the filtered results.

**Use this instead of Webflow's own pagination.** Webflow's "Paginate items" sends only one page of cards to the browser, so the filter could only see those. Keep every item on the page: turn pagination off on the Collection List (up to 100 items), or use [Finsweet List Load](#more-than-100-items-finsweet-list-load) past 100.

1. Below your grid, add a **Div Block** for the pager. Give it the class `pager`, and lay it out as you like, for example Display Flex, centered, 8px gap.
2. Add `data-filter-pagination` = `advisors` and `data-filter-page-size` = `12`.
3. Inside the pager, add a **Button** with the text "Previous" (the **Button** element from the Add panel's Basic section, not a form's Submit button) and the class `pager-step`. Add `data-filter-prev` = `true`.
4. After it, add a **Div Block** with the class `pager-pages` for the page numbers. Add `data-filter-pages` = `true`.
5. Inside `pager-pages`, add one **Button** with the text **1** and the class `pager-page`. Add `data-filter-page` = `true`. Every page number is copied from it. If you use a Link Block with a Text Block inside instead, put `data-filter-page-label` = `true` on the Text Block, so the script knows where to write each number.
6. Optional: inside `pager-pages`, after the page button, add a **Text Block** with "…" and `data-filter-page-gap` = `true`. With more than 7 pages, the pager then shows the first page, the last page and the pages next to the current one, with "…" between them. Without it, every page number shows.
7. After `pager-pages`, add a **Button** with the text "Next" and the class `pager-step`. Add `data-filter-next` = `true`.

**Style the current page and the ends.** The script adds two classes you style as combo classes:
- `is-current` on the current page number. Select the page button, type `is-current` in the selector to add it as a combo class, style it (for example a white background), then remove the combo class from that button. The script adds it back on the right page.
- `is-disabled` on Previous on page 1, and on Next on the last page. Add and style it the same way on a `pager-step` button.

Because no element carries `is-current` or `is-disabled` in the Designer, Webflow's **Clean up** (unused styles) would delete them. Skip Clean up for these two, or keep a hidden style-guide element that uses them.

To use other names, add `data-filter-current-class` or `data-filter-disabled-class` to the pager.

**Also good to know**
- The pager hides itself when everything fits on one page.
- Optional: a Text Block with `data-filter-range` = `advisors` shows "Showing 13 to 24 of 100."
- Changing pages scrolls back to the bar when it's above the screen. If you have a sticky header, give the bar a top **scroll margin** so the header doesn't cover it.

### Step 7: Optional settings on the bar

Add these to the bar element (`filter-bar`) as custom attributes:

| Attribute | What it does | Default |
|---|---|---|
| `data-filter-sort` = `cms` | Keeps the order values first appear in your list | A to Z |
| `data-filter-duration` | How long the thumb's move takes, in milliseconds. `0` turns the animation off. | `420` |
| `data-filter-squash` | How far the thumb overshoots before settling, in px. `0` gives a plain slide. | `3` |
| `data-filter-card-motion` = `off` | Turns off the cards' scale-up and glide for this bar | On |
| `data-filter-field` | A field name, like `state`, for [two bars on one list](#two-bars-on-one-list) | All `data-filter-value` text |
| `data-filter-spread-class` | The class added to the filters when the bar has no search field | `is-spread` |

#### Card motion

The cards animate on their own when someone picks a filter or changes pages. You don't build anything for it, and you shouldn't add Webflow Interactions to the cards, because they would fight with it.

- **Cards that appear** scale up from 94% to 102%, then settle at 100%, while fading in. Each starts 40ms after the one before. The whole move takes about half a second.
- **Cards that stay but move** (they match both the old and the new filter) glide from their old spot and stop exactly on their new one, then bounce the same small amount.
- **Cards that stay in the same spot** bounce in place, from 100% to 102% and back, without fading. For example, an advisor in both Kentucky and Tennessee who's first in both lists.
- **Every visible card takes part, in grid order,** each starting 40ms after the one before (capped after 12 cards).
- **On phones (767px and below, Webflow's Mobile landscape and Mobile portrait), the bounce is smaller and anchored to the card's top edge:** 97% to 100.8%, growing downward, so a card never moves up into the bar or the text above it.
- **Typing in search doesn't animate,** so results keep up with each keystroke.
- **Reduced motion turns it off.** With Reduce Motion on in someone's device settings, cards simply appear.
- **To turn it off for one bar,** add `data-filter-card-motion` = `off` to the bar.

The script animates the **Collection Item** (the element with `data-filter-item`), so a hover effect on your card inside it still works. If your Collection Items already use a transform for their own look, the animation briefly overrides it while it plays.

**Focus ring:** keyboard users see an outline around the bar when a filter has focus. To change it, select the bar's class, open **Custom properties** in the Style panel, and add `--filter-focus` (a color) and `--filter-focus-offset` (a length, like `-2px`). Without them, it uses the current text color, 2px out.

### Step 8: Publish and test

Custom code doesn't run in the Designer or Preview mode. Publish to your **webflow.io staging** domain, then check:

- [ ] The filters show All, then your states, A to Z.
- [ ] The thumb sits behind All, in your active colors.
- [ ] Tapping a filter slides the thumb and filters the cards. Dragging the thumb snaps to the nearest filter.
- [ ] Search filters as you type, and Enter doesn't reload the page.
- [ ] The count updates, and the empty message shows only when nothing matches.
- [ ] Tab reaches the filters, and the arrow keys, Home and End move between them.
- [ ] Previous, Next and the page numbers change pages, and a new filter goes back to page 1.
- [ ] Each page shows no more than your page size, and the pager hides when everything fits on one page.
- [ ] Picking a filter makes new cards scale up with a small bounce, one after another, and cards that stay glide into place.
- [ ] With Reduce Motion turned on in your device settings, the thumb jumps and the cards appear with no animation.
- [ ] On desktop and every iPad width, search shares its line with the first filters. On a phone held upright, search sits on top.
- [ ] Nothing scrolls sideways at 320px.

## Use it on the whole site

Instead of Step 1, paste the script once for every page:

1. Open **Site settings**, then **Custom code**, then **Head code** (not Footer code, which loads too late and causes a white bar and empty-message flash on page load).
2. Type `<script>`, paste the whole of `webflow/filter-bar.js`, then type `</script>`.
3. Save and publish.

On pages with no filter bar, it does nothing. Steps 2 to 8 stay the same on each page with a bar.

**Moving to the whole site later:** add it to Site settings, then delete it from the Component's Embed or from each page. Leaving both won't break anything, because the script runs only once per page, but the extra copy adds to the page's size.

## Use it with other collections

One Component can filter advisors on one page, events on another, and articles somewhere else, or several on the same page. Each instance pulls from its own Collection List.

### How instances stay separate

Every instance has a **group name**, like `advisors`, `events` or `articles`. The script only connects pieces that share a group name:

| Piece | Attribute that carries the group name |
|---|---|
| The bar | `data-filter-bar` |
| The count | `data-filter-status` |
| The empty message | `data-filter-empty` |
| The pager | `data-filter-pagination` |
| The range text | `data-filter-range` |
| Each Collection Item | `data-filter-item` |

So a bar named `events` only filters items tagged `data-filter-item` = `events`, and only updates the count, empty message and pager named `events`.

**Rules for group names**
- They must match exactly, including capitalization. `Events` and `events` won't connect.
- Two instances on the same page need different names.
- Use lowercase words with no spaces, like `events` or `case-studies`.

### Set up the Component's properties (once)

Instead of typing the group name into each attribute, connect those attributes to Component properties. Then each instance gets its own values. Webflow lets you connect a custom attribute's value to a Component property ([component properties](https://help.webflow.com/lesson/component-properties), [custom attributes](https://help.webflow.com/hc/en-us/articles/33961389460115), [dynamic attributes for components](https://webflow.com/updates/dynamic-attributes-for-components)).

1. Double-click the Component (or choose **Edit component**) to edit its contents.
2. **Group:** select the bar. In **Element settings**, find the `data-filter-bar` attribute. Instead of typing a value, use the value field's option to **connect it to a property**, create a new **Text** property named **Group**, and give it the default `advisors`.
3. Connect the same **Group** property to:
   - `data-filter-status` on the count text
   - `data-filter-empty` on the empty message
   - `data-filter-pagination` and `data-filter-range`, if your pager or range text is inside the Component
4. **Noun:** select the count text. Connect `data-filter-noun` to a new **Text** property named **Noun**, default `advisor`. If some collections need an unusual plural, also connect `data-filter-noun-plural` to a property named **Noun plural**.
5. **Label:** select the bar. Connect `data-filter-label` to a new **Text** property named **Label**, default `Filter advisors by state`.
6. **Show search:** select the search Form Block. In **Element settings**, connect its **Visibility** to a new **Visibility** property named **Show search**, default on.
7. **Empty message text:** select the empty message's text and connect it to a new **Text** property named **Empty message**, so each collection can say something fitting, like "No events match."
8. Optional: connect `data-filter-sort` on the bar to a **Text** property named **Sort**. Leave it empty for A to Z, or type `cms` on an instance to keep CMS order.

**A bar without search spreads its filters on its own.** When an instance has **Show search** off, the script adds the `is-spread` combo class to its "All" option (and so to every filter), and the filters share the bar's width evenly. You style `is-spread` once (see [2c](#2c-the-all-option)). To use a different class name, add `data-filter-spread-class` to the bar.

### Add an instance for another collection

These steps add an events filter. Swap in your own collection and names.

**1. Place the Component**
1. Drag the filter Component onto the page, above the Events Collection List.
2. In the instance's **properties** panel, set:
   - **Group:** `events`
   - **Noun:** `event`
   - **Label:** `Filter events by type`
   - **Show search:** on or off
   - **Empty message:** your text, like "No events match. Try another type."

**2. Tag the Events Collection List**
1. Select the Events **Collection List**. Turn **pagination off**, and make sure no item limit cuts events off (up to 100; past 100, see [Finsweet List Load](#more-than-100-items-finsweet-list-load)).
2. Select the **Collection Item** (the grid's direct child) and add `data-filter-item` = `events`.

**3. Tag what each item is filtered by**
1. Decide which field the filters come from, like the event's **Type**.
2. If it's an **Option** or **plain text** field: inside the Collection Item, add a **Text Block** bound to that field. Add `data-filter-value` = `true`. Hide it with a class set to **Display: None** if it shouldn't show.
3. If it's a **reference** field: add a Text Block bound to the referenced item's **Name**, with `data-filter-value` = `true`.
4. If it's a **multi-reference** field: add a nested **Collection List** with that field as its source, a Text Block inside it bound to **Name**, and `data-filter-value` = `true` on the Text Block. Hide the nested list if it shouldn't show.
5. If the text already shows on the card, like a "Workshop" tag, put `data-filter-value` = `true` right on that Text Block instead.

**4. Tag what search looks at (only if Show search is on)**
1. On each text search should match, like the event's title and city, add `data-filter-search-text` = `true`.
2. Without any, search looks at all of the item's text.

**5. Add a pager (optional)**
Follow [Step 6](#step-6-pagination-optional), using `events` as the group name in `data-filter-pagination` and `data-filter-range`. If the pager is also a Component, give it its own **Group** property connected to those two attributes.

**6. Publish and check**
- The events filter shows All, then only the event types that events actually have.
- Filtering events doesn't change the advisors filter on the same page, and the other way around.
- The count reads "4 events in Workshop," using the instance's noun.

### Several instances on one page

Nothing extra is needed beyond different group names. The script runs once and handles every bar on the page. Each instance keeps its own selected filter, search text, count and page.

## Two bars on one list

To filter one list two ways, like advisors by state and by service, use two bars with the **same** group name and a different **field** each. Items show only when they match both bars.

1. Build two bars (or place the Component twice) with the same group name, like `advisors`.
2. On the first bar, add `data-filter-field` = `state`. On the second, add `data-filter-field` = `service`.
3. On each Collection Item, tag both kinds of values:
   - state names with `data-filter-value` = `state` (not `true`)
   - service names with `data-filter-value` = `service`
4. Each bar builds its filters only from the values with its field name.
5. Use one count and one empty message for the group. The count lists both picks, like "3 advisors in Indiana, Retirement."

If the second bar has no search field, it spreads its filters on its own, like any bar without search.

## Equal card heights (optional)

When a card has extra lines (a wrapped name or title, or extra offices in a location bar), the card body moves up over the bottom of the photo, so every card in the grid stays the same height. The photo isn't resized; its bottom edge is covered.

1. On the card's **photo wrapper**, add `data-fit-photo` = `true`. This is the part that gives up space.
2. On every text that may wrap onto more lines, like the **name** and **title**, add `data-fit-text` = `true`.
3. On an area that grows when it has more lines, like a **location bar** listing secondary offices, add `data-fit-grow` = `true`.
4. On the **first line** inside that area, like the **home office** text, add `data-fit-base` = `true`. Anything below it counts as extra.
5. Give every element after the photo (the card body and the location bar) a **background color**. They sit over the photo's bottom edge, and without a background the photo shows through.
6. Keep the photo wrapper in normal flow. Don't set it to Position: Absolute.

| Attribute | Goes on |
|---|---|
| `data-fit-photo` | The photo wrapper |
| `data-fit-text` | Any text that may wrap, like the name and title |
| `data-fit-grow` | An area that grows with extra lines, like a location bar |
| `data-fit-base` | The first line inside that area, like the home office |

This works with or without the filter bar. If the card isn't inside a `data-filter-item`, the script treats the photo's parent as the card.

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
| Nothing happens | The script isn't in a Code Embed, the page's head code or the site's Head code, it's missing its script tags, or you're in Preview mode. Custom code only runs on the published site. |
| Only "All" shows | Items have no `data-filter-value`, or the bar and items use different group names |
| Filters miss cards on other pages | Webflow's "Paginate items" is on without Finsweet List Load. Use the bar's own pager instead (Step 6). |
| The thumb is missing | The bar needs a `data-filter-thumb` element inside it. The browser console names the bar. |
| The active label is the wrong color | Set the text color on the thumb, not on the option |
| Search sits on its own line on a tablet or desktop | The search Form Block isn't directly inside the bar, or its Mobile portrait settings were set on a larger breakpoint. Make it the bar's first child, and keep the full-width settings on Mobile portrait only. |
| An extra gap inside the bar | The Code Embed sits inside the bar. Move it above the bar, as the first child of `filter-wrapper`. |
| The whole bar flashes white, or the empty message flashes, on page load | The script loads after the bar. Move the Code Embed above the bar, or use the head code field instead of Before `</body>` or Footer code. |
| Empty gaps in the grid | `data-filter-item` is on the card instead of the Collection Item, or items are pinned to grid cells |
| Enter reloads the page | The Input isn't the one with `data-filter-search` |

## Known limits

- Webflow limits nested Collection Lists per page and items per nested list. Check them against your busiest card.
- I tested the filter with up to 150 items on one page. Every filter, search keystroke and page change took under 6ms.
- The search field sits inside the filter group, so screen readers hear it as part of "Filter advisors by state." It has its own label, so it's still usable.
- With many filters, the search field stays near its 240px minimum, because the filters claim its line first.
- The count reads "in" before the active option (for example "in Kentucky"). Change that word in the script if it reads oddly for another list.
- The filter doesn't change the URL, so you can't share a link to a filtered view.
- There's no limit on how much of a photo equal heights can cover.
