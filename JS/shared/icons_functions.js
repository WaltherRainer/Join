/**
 * Generates an SVG markup string with configurable size and content.
 *
 * If `content` is not provided but `paths` are given, the SVG body is built
 * automatically from the path definitions (using `color` as default fill).
 * Optional `<defs>` content can be injected as well.
 *
 * @function iconSvg
 * @param {Object} [options={}] - SVG configuration options.
 * @param {number} [options.width=20] - SVG width attribute.
 * @param {number} [options.height=20] - SVG height attribute.
 * @param {string} [options.viewBox="0 0 20 20"] - SVG viewBox attribute.
 * @param {Array<{d: string, fill?: string}>|null} [options.paths=null] - Optional path definitions used to auto-generate content.
 * @param {string} [options.color="currentColor"] - Default fill color for auto-generated paths.
 * @param {string} [options.content=""] - Raw SVG inner markup (overrides auto-generated content).
 * @param {string} [options.defs=""] - Raw SVG defs markup to be wrapped in `<defs>...</defs>`.
 * @returns {string} SVG markup string.
 */
function iconSvg({ width = 20, height = 20, viewBox = "0 0 20 20", paths = null, color = "currentColor", content = "", defs = "" } = {}) {
  const autoContent =
    Array.isArray(paths) && paths.length ? paths.map((p) => `<path d="${p.d}" ${p.fill ? `fill="${p.fill}"` : `fill="${color}"`}></path>`).join("") : "";
  return `
    <svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${defs ? `<defs>${defs}</defs>` : ""}
      ${content || autoContent}
    </svg>
  `;
}

/**
 * Generates a pseudo-random identifier string with an optional prefix.
 *
 * Uses `Math.random()` and base-36 encoding to create a short, non-cryptographic ID.
 *
 * @function uniqueId
 * @param {string} [prefix="id"] - Prefix to prepend to the generated ID.
 * @returns {string} Generated ID in the form `${prefix}-xxxxxxx`.
 */
function uniqueId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Renders all icons within a given DOM subtree.
 *
 * Searches the provided root element for nodes with the `[data-icon]`
 * attribute and delegates the rendering of each icon to {@link renderIconInto}.
 *
 * @function renderIcons
 * @param {ParentNode} [root=document] - DOM root to search within.
 * @returns {void}
 */
function renderIcons(root = document) {
  if (!root?.querySelectorAll) return;

  root.querySelectorAll("[data-icon]").forEach(renderIconInto);
}

/**
 * Injects an SVG icon into the given element based on its `data-icon` attribute.
 *
 * Looks up the icon render function in {@link ICONS}, prevents duplicate
 * insertion if an SVG already exists, reads size arguments from the element's
 * dataset, and appends the generated SVG markup. The inserted SVG is marked
 * as decorative via ARIA attributes.
 *
 * @function renderIconInto
 * @param {HTMLElement} el - Target element that provides `data-icon` and receives the SVG.
 * @returns {void}
 */
function renderIconInto(el) {
  const name = el.dataset.icon;
  const fn = ICONS?.[name];
  if (typeof fn !== "function") {
    console.warn("Unknown icon:", name, el);
    return;
  }
  if (el.querySelector("svg")) return;
  const args = readIconSizeArgs(el.dataset);
  el.insertAdjacentHTML("beforeend", fn(args));
  const svg = el.querySelector("svg");
  if (svg) {
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
  }
}

/**
 * Parses optional icon size arguments from a dataset object.
 *
 * Converts `dataset.w` and `dataset.h` to numbers and returns an args object
 * containing `width` and/or `height` when the values are finite.
 *
 * @function readIconSizeArgs
 * @param {DOMStringMap|Object} dataset - Dataset containing optional `w` and `h` values.
 * @returns {{width?: number, height?: number}} Parsed size arguments for icon rendering.
 */
function readIconSizeArgs(dataset) {
  const args = {};
  const w = dataset.w;
  if (w !== undefined) {
    const width = Number(w);
    if (Number.isFinite(width)) args.width = width;
  }
  const h = dataset.h;
  if (h !== undefined) {
    const height = Number(h);
    if (Number.isFinite(height)) args.height = height;
  }
  return args;
}

function editPencilBig({ size = 69 } = {}) {
  const maskId = `mask-editPencil-${Math.random().toString(36).slice(2, 9)}`;

  return iconCircleWrapper({ size, circleFill: "var(--svg_hover_main)", defs: `
      <mask id="${maskId}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="18" width="33" height="33">
        <rect x="18.5" y="18.5" width="32" height="32" fill="#D9D9D9" />
      </mask>
    `, content: `
      <g mask="url(#${maskId})">
        <path
          d="M25.1667 43.8332H27.0333L38.5333 32.3332L36.6667 30.4665L25.1667 41.9665V43.8332ZM44.2333 30.3998L38.5667 24.7998L40.4333 22.9332C40.9444 22.4221 41.5722 22.1665 42.3167 22.1665C43.0611 22.1665 43.6889 22.4221 44.2 22.9332L46.0667 24.7998C46.5778 25.3109 46.8444 25.9276 46.8667 26.6498C46.8889 27.3721 46.6444 27.9887 46.1333 28.4998L44.2333 30.3998ZM42.3 32.3665L28.1667 46.4998H22.5V40.8332L36.6333 26.6998L42.3 32.3665Z"
          fill="var(--inner_svg_main)"
        />
      </g>
    `,
  });
}

function prioUrgentBig({ size = 60 } = {}) {
  const clipId = `clip-prioUrgentBig-${Math.random().toString(36).slice(2, 9)}`;
  return iconCircleWrapper({ size, circleFill: "#FF3D00", defs: `
      <clipPath id="${clipId}">
        <rect width="34.186" height="25.1163" fill="white" transform="translate(12.5581 16.0464)" />
      </clipPath>
    `, content: `
      <g clip-path="url(#${clipId})">
        <path d="M44.8709 41.1626C44.4699 41.1633 44.0792 41.0337 43.7563 40.7929L29.6511 30.263L15.5458 40.7929C15.3478 40.941 15.1229 41.0482 14.8839 41.1084C14.645 41.1685 14.3966 41.1805 14.1531 41.1435C13.9096 41.1066 13.6757 41.0214 13.4647 40.893C13.2536 40.7645 13.0697 40.5953 12.9233 40.3949C12.777 40.1945 12.6711 39.9669 12.6116 39.7251C12.5522 39.4832 12.5404 39.2319 12.5769 38.9855C12.6507 38.4878 12.9168 38.0402 13.3167 37.7411L28.5365 26.3677C28.8591 26.126 29.2498 25.9956 29.6511 25.9956C30.0524 25.9956 30.4431 26.126 30.7657 26.3677L45.9855 37.7411C46.3033 37.9781 46.5389 38.3106 46.6588 38.6912C46.7788 39.0718 46.7768 39.481 46.6532 39.8604C46.5296 40.2398 46.2907 40.57 45.9706 40.8039C45.6506 41.0377 45.2657 41.1633 44.8709 41.1626Z" fill="white" />
        <path d="M44.8708 31.2109C44.4697 31.2116 44.0791 31.082 43.7562 30.8413L29.651 20.3114L15.5457 30.8413C15.1458 31.1404 14.6448 31.2665 14.153 31.1919C13.6612 31.1172 13.2188 30.8479 12.9232 30.4432C12.6276 30.0385 12.503 29.5315 12.5768 29.0339C12.6506 28.5362 12.9167 28.0885 13.3166 27.7894L28.5364 16.416C28.859 16.1744 29.2497 16.0439 29.651 16.0439C30.0523 16.0439 30.443 16.1744 30.7655 16.416L45.9854 27.7894C46.3031 28.0264 46.5388 28.359 46.6587 28.7396C46.7786 29.1202 46.7767 29.5294 46.6531 29.9088C46.5295 30.2882 46.2906 30.6184 45.9705 30.8522C45.6505 31.0861 45.2656 31.2116 44.8708 31.2109Z" fill="white" />
      </g>
    `,
  });
}
