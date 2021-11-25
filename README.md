## Outdated; see [dzaima/chatlogs](https://github.com/dzaima/chatlogs) for updated logs & interface & other rooms

### The APL Orchard dump
Usage: download, and either manually use the `all.json` file, or open `index.html` for searching and formatting.

Search: `a&b|c&d` will find all messages either containing both `a` and `b`, or `c` and `d`. Alternatively, prepending a space will match `a&b|c&d` exactly.

Within the browser JS console, you can also do `matched = j.filter(c=>c.html.includes(whatever)); render();` to filter or sort by arbitrary rules.

You may want to change line 2 in `main.js` to reflect your own user ID.
