# PlaylistEval project page

Source of <https://playlisteval.github.io>, the project page for
*PlaylistEval: Can Video-Language Judges Be Trusted at Day Scale and Beyond?*
(Shayekh Bin Islam and Hwanjun Song, KAIST).

It is a static page with no build step: GitHub Pages serves the `main` branch as is.

```
index.html                 page content (hero, figures, abstract, results, BibTeX, acknowledgements)
assets/css/style.css       styles (light theme only, green palette)
assets/js/main.js          results data (Table 1) and the interactive leaderboard / domain table
assets/img/figures/        Figure 1 and Figure 2 as WebP, 1200 px and 2400 px wide
assets/img/logos/          model-family logos used in the results table
assets/img/og.jpg          1200x630 social preview
assets/img/favicon.svg     site icon (also the top-bar logo)
assets/img/apple-touch-icon.png  180x180 iOS home-screen icon
.nojekyll                  serve files as is, without Jekyll
```

## Common edits

- **Code / Dataset links.** In `index.html`, replace `href="#"` on the button with the real URL.
  A button that still points at `#` is shown greyed out with a "soon" tag. The Paper button links to
  arXiv ([2609.34314](https://arxiv.org/abs/2609.34314)).
- **Results.** Edit the `JUDGES` array at the top of `assets/js/main.js`. Each entry holds the overall
  retrieved / uniform accuracy, the gain as printed in the paper, and per-domain `[retrieved, uniform]` pairs
  in the order Education, Drama, Life, Art, History, Documentary, Podcast.
- **BibTeX.** Edit the `<pre id="bibtex">` block in `index.html`. It holds the arXiv entry exactly as the
  authors provided it; the Copy button copies that text as is.

## Regenerating the figures

The figures are rendered from the paper's PDFs with PyMuPDF and Pillow:

```python
import fitz, io
from PIL import Image

for src, name in [("figures/example_qa.drawio.pdf", "example"), ("figures/pipeline.drawio.pdf", "pipeline")]:
    page = fitz.open(src)[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2400 / page.rect.width, 2400 / page.rect.width))
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    for w in (2400, 1200):
        out = img if w == img.width else img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
        out.save(f"assets/img/figures/{name}-{w}.webp", "WEBP", quality=88, method=6)
```

Run it from the paper's source folder, pointing the output paths at this repository.
If a figure's aspect ratio changes, update the `width` / `height` attributes of its `<img>` in `index.html`.

## Preview locally

Open `index.html` directly in a browser, or serve the folder:

```
python -m http.server 8000
```

## Credits

The page design is adapted from the [World Tracing project page](https://haoz19.github.io/world-tracing-page/) by World Labs.
