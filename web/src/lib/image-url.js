import clientConfig from "../../client-config";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(clientConfig.sanity);

export function imageUrlFor(source) {
  return builder.image(source);
}

export function buildResponsiveImageAttrs(source, options = {}) {
  if (!source) {
    return { src: "", srcSet: "", sizes: options.sizes || "100vw" };
  }

  const {
    widths = [320, 480, 640, 768, 960, 1200],
    sizes = "100vw",
    aspectRatio = null,
    fit = "crop",
    quality = 72,
    auto = "format",
  } = options;

  const normalizedWidths = [...new Set(widths)]
    .map((value) => Math.round(Number(value) || 0))
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  const safeWidths = normalizedWidths.length ? normalizedWidths : [1200];

  const buildUrl = (width) => {
    let urlBuilder = imageUrlFor(source).width(width).fit(fit).auto(auto);
    if (aspectRatio && Number(aspectRatio) > 0) {
      const height = Math.max(1, Math.round(width / Number(aspectRatio)));
      urlBuilder = urlBuilder.height(height);
    }
    if (quality && Number(quality) > 0) {
      urlBuilder = urlBuilder.quality(Math.round(Number(quality)));
    }
    return urlBuilder.url();
  };

  const largest = safeWidths[safeWidths.length - 1];
  return {
    src: buildUrl(largest),
    srcSet: safeWidths.map((width) => `${buildUrl(width)} ${width}w`).join(", "),
    sizes,
  };
}