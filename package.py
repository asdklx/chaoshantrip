#!/usr/bin/env python3
"""Build the self-contained HTML copy from the editable project sources.

The normal source page (index.html) keeps CSS and JavaScript in separate files
for editing.  This small, dependency-free packager inlines the local stylesheet
and moves the scripts to the end of the body, preserving their source order.
This keeps deferred scripts from running before the page's elements exist.
It writes atomically so a failed build never leaves a partial output file.
Example:

    python3 package.py output/潮汕小行.html

Use a temporary destination (for example ``output/潮汕小行.new.html``) while
reviewing a change, then rerun with the final destination when ready.
"""

from __future__ import annotations

import argparse
import re
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DEFAULT_DEST = ROOT / "output" / "潮汕小行.html"


def _read(relative: str) -> str:
    path = ROOT / relative
    return path.read_text(encoding="utf-8")


def build(source: Path, destination: Path) -> None:
    html = source.read_text(encoding="utf-8")

    css_pattern = re.compile(
        r'<link\s+rel=["\']stylesheet["\']\s+href=["\']styles\.css["\']\s*/?>',
        re.IGNORECASE,
    )
    html, css_count = css_pattern.subn(
        lambda _match: "<style>\n" + _read("styles.css") + "\n</style>", html, count=1
    )
    if css_count != 1:
        raise ValueError(f"expected one styles.css link, found {css_count}")

    script_pattern = re.compile(
        r'<script\s+defer\s+src=["\']([^"\']+)["\']\s*></script>',
        re.IGNORECASE,
    )

    inline_scripts: list[str] = []

    def collect_script(match: re.Match[str]) -> str:
        relative = match.group(1)
        # Only local project assets belong in the standalone file.  Keeping this
        # strict catches accidental new external dependencies early.
        if relative.startswith(("http://", "https://", "//")):
            raise ValueError(f"refusing to inline external script: {relative}")
        path = Path(relative)
        if path.is_absolute() or ".." in path.parts:
            raise ValueError(f"unsafe script path: {relative}")
        script = _read(relative)
        # A literal closing script tag would terminate the containing HTML
        # element.  Fail loudly rather than silently producing broken output.
        if re.search(r"</script", script, re.IGNORECASE):
            raise ValueError(f"script contains a literal closing tag: {relative}")
        inline_scripts.append("<script>\n" + script + "\n</script>")
        return ""

    html, script_count = script_pattern.subn(collect_script, html)
    if script_count == 0:
        raise ValueError("no local deferred scripts found in index.html")

    # Inline classic scripts ignore `defer`.  Run them after all body markup
    # has been parsed so app.js can resolve the DOM elements it initializes.
    body_end = re.compile(r"</body\s*>", re.IGNORECASE)
    if len(body_end.findall(html)) != 1:
        raise ValueError("expected exactly one closing body tag")
    html = body_end.sub(lambda match: "\n".join(inline_scripts) + "\n" + match.group(0), html)

    # The output should not still depend on local files.  External URLs in the
    # app (maps/search/source links) are intentionally left untouched.
    for marker in ('href="styles.css"', "href='styles.css'", 'src="app.js"', "src='app.js'"):
        if marker in html:
            raise ValueError(f"unresolved local asset reference: {marker}")

    # Script tags are removed from indented source lines, which can otherwise
    # leave whitespace-only lines in the standalone artifact.  Normalize
    # trailing whitespace so generated files stay clean under `git diff --check`.
    html = "\n".join(line.rstrip() for line in html.splitlines()) + "\n"

    destination.parent.mkdir(parents=True, exist_ok=True)
    # Preserve an existing output mode when replacing a file; otherwise follow
    # the source page's mode (normally 0644).
    output_mode = (destination.stat().st_mode if destination.exists() else source.stat().st_mode) & 0o777
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=destination.parent, prefix=f".{destination.name}.", delete=False
    ) as handle:
        temporary = Path(handle.name)
        handle.write(html)
    temporary.chmod(output_mode)
    temporary.replace(destination)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", nargs="?", type=Path, default=DEFAULT_DEST)
    parser.add_argument("--source", type=Path, default=ROOT / "index.html")
    args = parser.parse_args()
    source = args.source if args.source.is_absolute() else ROOT / args.source
    destination = args.destination if args.destination.is_absolute() else ROOT / args.destination
    build(source, destination)
    print(f"Wrote {destination} ({destination.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
