/**
 * Generates an SVG icon wrapped inside a circular background.
 *
 * Uses {@link iconSvg} to render a circle of the specified size and fill color,
 * then injects optional SVG definitions and inner content.
 *
 * @function iconCircleWrapper
 * @param {Object} [options={}]
 * @param {number} [options.size=69] - Diameter of the circular wrapper.
 * @param {string} [options.viewBox=`0 0 ${size} ${size}`] - SVG viewBox definition.
 * @param {string} [options.circleFill="var(--svg_hover_main)"] - Fill color of the background circle.
 * @param {string} [options.defs=""] - Optional SVG `<defs>` content.
 * @param {string} [options.content=""] - Inner SVG markup placed above the circle.
 * @returns {string} SVG markup string for the wrapped icon.
 */
function iconCircleWrapper({ size = 69, viewBox = `0 0 ${size} ${size}`, circleFill = "var(--svg_hover_main)", defs = "", content = "" } = {}) {
  return iconSvg({
    width: size,
    height: size,
    viewBox,
    defs,
    content: `
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${circleFill}" />
      ${content}
    `,
  });
}

/**
 * Generates an SVG string for an "add user" icon (user silhouette with plus symbol).
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data, allowing
 * optional overrides for width, height, and color.
 *
 * @function addUserIcon
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the add-user icon.
 */
function addUserIcon({ width = 20, height = 18, color } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 18",
    color,
    paths: [
      {
        d: "M23.9961 12.9111C23.6802 12.9111 23.4167 12.8046 23.2056 12.5917C22.9945 12.3787 22.8889 12.1148 22.8889 11.8V8.68887H19.7778C19.463 8.68887 19.1991 8.58201 18.9861 8.3683C18.7731 8.15459 18.6667 7.88978 18.6667 7.57387C18.6667 7.25796 18.7731 6.99444 18.9861 6.78333C19.1991 6.57222 19.463 6.46667 19.7778 6.46667H22.8889V3.35553C22.8889 3.04073 22.9958 2.77684 23.2095 2.56387C23.4232 2.35091 23.688 2.24443 24.0039 2.24443C24.3198 2.24443 24.5833 2.35091 24.7944 2.56387C25.0055 2.77684 25.1111 3.04073 25.1111 3.35553V6.46667H28.2222C28.537 6.46667 28.8009 6.57352 29.0139 6.78723C29.2269 7.00095 29.3333 7.26576 29.3333 7.58167C29.3333 7.89758 29.2269 8.16109 29.0139 8.3722C28.8009 8.58331 28.537 8.68887 28.2222 8.68887H25.1111V11.8C25.1111 12.1148 25.0042 12.3787 24.7905 12.5917C24.5768 12.8046 24.312 12.9111 23.9961 12.9111ZM10.6667 10.2222C9.2 10.2222 7.98148 9.73702 7.0111 8.76667C6.04074 7.79629 5.55557 6.57777 5.55557 5.1111C5.55557 3.64443 6.04074 2.42592 7.0111 1.45557C7.98148 0.485189 9.2 0 10.6667 0C12.1333 0 13.3519 0.485189 14.3222 1.45557C15.2926 2.42592 15.7778 3.64443 15.7778 5.1111C15.7778 6.57777 15.2926 7.79629 14.3222 8.76667C13.3519 9.73702 12.1333 10.2222 10.6667 10.2222ZM1.1111 20.9111C0.7963 20.9111 0.532411 20.8046 0.319433 20.5917C0.106478 20.3787 0 20.1148 0 19.8V17.5778C0 16.8074 0.198144 16.1056 0.594433 15.4722C0.990745 14.8389 1.53334 14.363 2.22223 14.0444C3.79261 13.3259 5.24697 12.8093 6.5853 12.4944C7.92366 12.1796 9.28291 12.0222 10.6631 12.0222C12.0432 12.0222 13.4037 12.1796 14.7444 12.4944C16.0852 12.8093 17.5333 13.3259 19.0889 14.0444C19.7778 14.3778 20.3241 14.8574 20.7278 15.4833C21.1315 16.1093 21.3333 16.8074 21.3333 17.5778V19.8C21.3333 20.1148 21.2269 20.3787 21.0139 20.5917C20.8009 20.8046 20.537 20.9111 20.2222 20.9111H1.1111ZM2.2222 18.6889H19.1111V17.5778C19.1111 17.2593 19.0315 16.9593 18.8722 16.6778C18.713 16.3963 18.4741 16.1852 18.1556 16.0444C16.7185 15.3407 15.4296 14.8648 14.2889 14.6167C13.1481 14.3685 11.9407 14.2444 10.6667 14.2444C9.3926 14.2444 8.18519 14.3722 7.04443 14.6278C5.9037 14.8833 4.60741 15.3555 3.15557 16.0444C2.86666 16.1852 2.63887 16.3963 2.4722 16.6778C2.30553 16.9593 2.2222 17.2593 2.2222 17.5778V18.6889ZM10.6667 8C11.4889 8 12.1759 7.72408 12.7278 7.17223C13.2796 6.62037 13.5556 5.93332 13.5556 5.1111C13.5556 4.28888 13.2796 3.60184 12.7278 3.05C12.1759 2.49813 11.4889 2.2222 10.6667 2.2222C9.84445 2.2222 9.15741 2.49813 8.60557 3.05C8.0537 3.60184 7.77777 4.28888 7.77777 5.1111C7.77777 5.93332 8.0537 6.62037 8.60557 7.17223C9.15741 7.72408 9.84445 8 10.6667 8Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a recycle/bin (delete) icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data, allowing
 * optional overrides for width, height, and color.
 *
 * @function recyBin
 * @param {Object} [options={}]
 * @param {number} [options.width=18] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the recycle/bin icon.
 */
function recyBin({ width = 18, height = 18, color } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 18",
    color,
    paths: [
      {
        d: "M7 18C6.45 18 5.97917 17.8042 5.5875 17.4125C5.19583 17.0208 5 16.55 5 16V3C4.71667 3 4.47917 2.9042 4.2875 2.7125C4.09583 2.5208 4 2.2833 4 2C4 1.7167 4.09583 1.4792 4.2875 1.2875C4.47917 1.0958 4.71667 1 5 1H9C9 0.7167 9.09583 0.4792 9.2875 0.2875C9.47917 0.0958 9.71667 0 10 0H14C14.2833 0 14.5208 0.0958 14.7125 0.2875C14.9042 0.4792 15 0.7167 15 1H19C19.2833 1 19.5208 1.0958 19.7125 1.2875C19.9042 1.4792 20 1.7167 20 2C20 2.2833 19.9042 2.5208 19.7125 2.7125C19.5208 2.9042 19.2833 3 19 3V16C19 16.55 18.8042 17.0208 18.4125 17.4125C18.0208 17.8042 17.55 18 17 18H7ZM7 3V16H17V3H7ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.7167 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.7167 10.9042 5.4792 10.7125 5.2875C10.5208 5.0958 10.2833 5 10 5C9.7167 5 9.4792 5.0958 9.2875 5.2875C9.0958 5.4792 9 5.7167 9 6V13ZM13 13C13 13.2833 13.0958 13.5208 13.2875 13.7125C13.4792 13.9042 13.7167 14 14 14C14.2833 14 14.5208 13.9042 14.7125 13.7125C14.9042 13.5208 15 13.2833 15 13V6C15 5.7167 14.9042 5.4792 14.7125 5.2875C14.5208 5.0958 14.2833 5 14 5C13.7167 5 13.4792 5.0958 13.2875 5.2875C13.0958 5.4792 13 5.7167 13 6V13Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a phone icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function phone
 * @param {Object} [options={}]
 * @param {number} [options.width=24] - Icon width attribute.
 * @param {number} [options.height=24] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the phone icon.
 */
function phone({ width = 24, height = 24, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 18 18",
    color,
    paths: [
      {
        d: "M16.95 18C14.8667 18 12.8083 17.5458 10.775 16.6375C8.74167 15.7292 6.89167 14.4417 5.225 12.775C3.55833 11.1083 2.27083 9.25833 1.3625 7.225C0.454167 5.19167 0 3.13333 0 1.05C0 0.75 0.1 0.5 0.3 0.3C0.5 0.1 0.75 0 1.05 0H5.1C5.33333 0 5.54167 0.0791667 5.725 0.2375C5.90833 0.395833 6.01667 0.583333 6.05 0.8L6.7 4.3C6.73333 4.56667 6.725 4.79167 6.675 4.975C6.625 5.15833 6.53333 5.31667 6.4 5.45L3.975 7.9C4.30833 8.51667 4.70417 9.1125 5.1625 9.6875C5.62083 10.2625 6.125 10.8167 6.675 11.35C7.19167 11.8667 7.73333 12.3458 8.3 12.7875C8.86667 13.2292 9.46667 13.6333 10.1 14L12.45 11.65C12.6 11.5 12.7958 11.3875 13.0375 11.3125C13.2792 11.2375 13.5167 11.2167 13.75 11.25L17.2 11.95C17.4333 12.0167 17.625 12.1375 17.775 12.3125C17.925 12.4875 18 12.6833 18 12.9V16.95C18 17.25 17.9 17.5 17.7 17.7C17.5 17.9 17.25 18 16.95 18ZM3.025 6L4.675 4.35L4.25 2H2.025C2.10833 2.68333 2.225 3.35833 2.375 4.025C2.525 4.69167 2.74167 5.35 3.025 6ZM11.975 14.95C12.625 15.2333 13.2875 15.4583 13.9625 15.625C14.6375 15.7917 15.3167 15.9 16 15.95V13.75L13.65 13.275L11.975 14.95Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a delete/close (cross) icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function delCross
 * @param {Object} [options={}]
 * @param {number} [options.width=18] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color="var(--blue)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the delete cross icon.
 */
function delCross({ width = 18, height = 18, color = "var(--blue)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 18 20",
    color,
    paths: [
      {
        d: "M9 11.4L4.1 16.3C3.91667 16.4833 3.68333 16.575 3.4 16.575C3.11667 16.575 2.88333 16.4833 2.7 16.3C2.51667 16.1167 2.425 15.8833 2.425 15.6C2.425 15.3167 2.51667 15.0833 2.7 14.9L7.6 10L2.7 5.1C2.51667 4.91667 2.425 4.68333 2.425 4.4C2.425 4.11667 2.51667 3.88333 2.7 3.7C2.88333 3.51667 3.11667 3.425 3.4 3.425C3.68333 3.425 3.91667 3.51667 4.1 3.7L9 8.6L13.9 3.7C14.0833 3.51667 14.3167 3.425 14.6 3.425C14.8833 3.425 15.1167 3.51667 15.3 3.7C15.4833 3.88333 15.575 4.11667 15.575 4.4C15.575 4.68333 15.4833 4.91667 15.3 5.1L10.4 10L15.3 14.9C15.4833 15.0833 15.575 15.3167 15.575 15.6C15.575 15.8833 15.4833 16.1167 15.3 16.3C15.1167 16.4833 14.8833 16.575 14.6 16.575C14.3167 16.575 14.0833 16.4833 13.9 16.3L9 11.4Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a confirmation checkmark icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function confTick
 * @param {Object} [options={}]
 * @param {number} [options.width=18] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color="var(--blue)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the confirmation tick icon.
 */
function confTick({ width = 18, height = 18, color = "var(--blue)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 18 18",
    color,
    paths: [
      {
        d: "M6.5502 11.15L15.0252 2.675C15.2252 2.475 15.4627 2.375 15.7377 2.375C16.0127 2.375 16.2502 2.475 16.4502 2.675C16.6502 2.875 16.7502 3.1125 16.7502 3.3875C16.7502 3.6625 16.6502 3.9 16.4502 4.1L7.2502 13.3C7.0502 13.5 6.81687 13.6 6.5502 13.6C6.28354 13.6 6.0502 13.5 5.8502 13.3L1.5502 9C1.3502 8.8 1.25437 8.5625 1.2627 8.2875C1.27104 8.0125 1.3752 7.775 1.5752 7.575C1.7752 7.375 2.0127 7.275 2.2877 7.275C2.5627 7.275 2.8002 7.375 3.0002 7.575L6.5502 11.15Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for an edit (pencil) icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function editPencil
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=20] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the edit pencil icon.
 */
function editPencil({ width = 20, height = 20, color } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 20",
    color,
    paths: [
      {
        d: "M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a large confirmation checkmark icon inside a circular background.
 *
 * Wraps {@link iconCircleWrapper} with a default size, themed circle fill, and
 * embedded checkmark path markup.
 *
 * @function confTickBig
 * @param {Object} [options={}]
 * @param {number} [options.size=69] - Diameter of the circular icon wrapper.
 * @returns {string} SVG markup string for the large confirmation tick icon.
 */
function confTickBig({ size = 69 } = {}) {
  return iconCircleWrapper({
    size,
    circleFill: "var(--svg_hover_main)",
    content: `
      <path
        d="M19.5283 34.5001L30.7571 45.5662L49.4717 23.4341"
        stroke="var(--inner_svg_main)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,
  });
}

/**
 * Generates an SVG string for an urgent-priority icon with a unique clip path.
 *
 * Uses {@link uniqueId} to create a collision-safe `clipPath` ID, then renders
 * the icon via {@link iconSvg} with configurable dimensions and color.
 *
 * @function prioUrgent
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=15] - Icon height attribute.
 * @param {string} [options.color="#FF3D00"] - Fill color for the urgent icon paths.
 * @returns {string} SVG markup string for the urgent-priority icon.
 */
function prioUrgent({ width = 20, height = 15, color = "#FF3D00" } = {}) {
  const clipId = uniqueId("clip-prioUrgent");
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 15",
    defs: `
      <clipPath id="${clipId}">
        <rect width="20" height="14.5098" fill="white" />
      </clipPath>
    `,
    content: `
      <g clip-path="url(#${clipId})">
        <path d="M18.9043 14.5096C18.6696 14.51 18.4411 14.4351 18.2522 14.2961L10.0001 8.21288L1.74809 14.2961C1.63224 14.3816 1.50066 14.4435 1.36086 14.4783C1.22106 14.513 1.07577 14.5199 0.933305 14.4986C0.790837 14.4772 0.653973 14.428 0.530528 14.3538C0.407083 14.2796 0.299474 14.1818 0.213845 14.0661C0.128216 13.9503 0.0662437 13.8188 0.0314671 13.6791C-0.00330956 13.5394 -0.0102098 13.3943 0.0111604 13.2519C0.0543195 12.9644 0.21001 12.7058 0.443982 12.533L9.34809 5.96249C9.53679 5.8229 9.76536 5.74756 10.0001 5.74756C10.2349 5.74756 10.4635 5.8229 10.6522 5.96249L19.5563 12.533C19.7422 12.6699 19.8801 12.862 19.9503 13.0819C20.0204 13.3018 20.0193 13.5382 19.9469 13.7573C19.8746 13.9765 19.7349 14.1673 19.5476 14.3024C19.3604 14.4375 19.1352 14.51 18.9043 14.5096Z" fill="${color}" />
        <path d="M18.9043 8.76057C18.6696 8.76097 18.4411 8.68612 18.2522 8.54702L10.0002 2.46386L1.7481 8.54702C1.51412 8.71983 1.22104 8.79269 0.93331 8.74956C0.645583 8.70643 0.386785 8.55086 0.213849 8.31706C0.0409137 8.08326 -0.0319941 7.79039 0.011165 7.50288C0.054324 7.21536 0.210015 6.95676 0.443986 6.78395L9.3481 0.213471C9.5368 0.0738799 9.76537 -0.00146484 10.0002 -0.00146484C10.2349 -0.00146484 10.4635 0.0738799 10.6522 0.213471L19.5563 6.78395C19.7422 6.92087 19.8801 7.11298 19.9503 7.33286C20.0204 7.55274 20.0193 7.78914 19.947 8.00832C19.8746 8.22751 19.7349 8.41826 19.5476 8.55335C19.3604 8.68844 19.1352 8.76096 18.9043 8.76057Z" fill="${color}" />
      </g>
    `,
  });
}

/**
 * Generates an SVG string for a medium-priority icon (double horizontal bars).
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function prioMedium
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=8] - Icon height attribute.
 * @param {string} [options.color="var(--prio-medium)"] - Fill color for the icon paths.
 * @returns {string} SVG markup string for the medium-priority icon.
 */
function prioMedium({ width = 20, height = 8, color = "var(--prio-medium)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 8",
    color,
    paths: [
      {
        d: "M18.9041 7.45086H1.09589C0.805242 7.45086 0.526498 7.33456 0.320979 7.12755C0.11546 6.92054 0 6.63977 0 6.34701C0 6.05425 0.11546 5.77349 0.320979 5.56647C0.526498 5.35946 0.805242 5.24316 1.09589 5.24316H18.9041C19.1948 5.24316 19.4735 5.35946 19.679 5.56647C19.8845 5.77349 20 6.05425 20 6.34701C20 6.63977 19.8845 6.92054 19.679 7.12755C19.4735 7.33456 19.1948 7.45086 18.9041 7.45086Z",
      },
      {
        d: "M18.9041 2.2077H1.09589C0.805242 2.2077 0.526498 2.0914 0.320979 1.88439C0.11546 1.67738 0 1.39661 0 1.10385C0 0.81109 0.11546 0.530322 0.320979 0.32331C0.526498 0.116298 0.805242 0 1.09589 0L18.9041 0C19.1948 0 19.4735 0.116298 19.679 0.32331C19.8845 0.530322 20 0.81109 20 1.10385C20 1.39661 19.8845 1.67738 19.679 1.88439C19.4735 2.0914 19.1948 2.2077 18.9041 2.2077Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a low-priority icon (double downward chevrons).
 *
 * Wraps {@link iconSvg} with predefined path data representing the low-priority
 * indicator while allowing optional overrides for width, height, and color.
 *
 * @function prioLow
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=15] - Icon height attribute.
 * @param {string} [options.color="var(--prio-low)"] - Fill color for the icon paths.
 * @returns {string} SVG markup string for the low-priority icon.
 */
function prioLow({ width = 20, height = 15, color = "var(--prio-low)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 15",
    color,
    paths: [
      {
        d: "M10 8.76077C9.7654 8.76118 9.53687 8.68634 9.34802 8.54726L0.444913 1.97752C0.329075 1.89197 0.231235 1.78445 0.15698 1.66111C0.0827245 1.53777 0.033508 1.40102 0.0121402 1.25868C-0.031014 0.971193 0.0418855 0.678356 0.214802 0.444584C0.387718 0.210811 0.646486 0.0552534 0.934181 0.0121312C1.22188 -0.0309911 1.51493 0.0418545 1.74888 0.214643L10 6.29712L18.2511 0.214643C18.367 0.129087 18.4985 0.0671675 18.6383 0.0324205C18.7781 -0.00232646 18.9234 -0.00922079 19.0658 0.0121312C19.2083 0.0334832 19.3451 0.0826633 19.4685 0.156864C19.592 0.231064 19.6996 0.328831 19.7852 0.444584C19.8708 0.560336 19.9328 0.691806 19.9676 0.831488C20.0023 0.97117 20.0092 1.11633 19.9879 1.25868C19.9665 1.40102 19.9173 1.53777 19.843 1.66111C19.7688 1.78445 19.6709 1.89197 19.5551 1.97752L10.652 8.54726C10.4631 8.68634 10.2346 8.76118 10 8.76077Z",
      },
      {
        d: "M10 14.5093C9.7654 14.5097 9.53687 14.4349 9.34802 14.2958L0.444913 7.72606C0.210967 7.55327 0.0552944 7.29469 0.0121402 7.00721C-0.031014 6.71973 0.0418855 6.42689 0.214802 6.19312C0.387718 5.95935 0.646486 5.80379 0.934181 5.76067C1.22188 5.71754 1.51493 5.79039 1.74888 5.96318L10 12.0457L18.2511 5.96318C18.4851 5.79039 18.7781 5.71754 19.0658 5.76067C19.3535 5.80379 19.6123 5.95935 19.7852 6.19312C19.9581 6.42689 20.031 6.71973 19.9879 7.00721C19.9447 7.29469 19.789 7.55327 19.5551 7.72606L10.652 14.2958C10.4631 14.4349 10.2346 14.5097 10 14.5093Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a plus (“add”) icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a cross-shaped
 * add symbol, while allowing optional overrides for width, height, and color.
 *
 * @function addCross
 * @param {Object} [options={}]
 * @param {number} [options.width=16] - Icon width attribute.
 * @param {number} [options.height=16] - Icon height attribute.
 * @param {string} [options.color="var(--blue)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the add icon.
 */
function addCross({ width = 16, height = 16, color = "var(--blue)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 18 16",
    color,
    paths: [
      {
        d: "M8 9H3C2.71667 9 2.47917 8.90417 2.2875 8.7125C2.09583 8.52083 2 8.28333 2 8C2 7.71667 2.09583 7.47917 2.2875 7.2875C2.47917 7.09583 2.71667 7 3 7H8V2C8 1.71667 8.09583 1.47917 8.2875 1.2875C8.47917 1.09583 8.71667 1 9 1C9.28333 1 9.52083 1.09583 9.7125 1.2875C9.90417 1.47917 10 1.71667 10 2V7H15C15.2833 7 15.5208 7.09583 15.7125 7.2875C15.9042 7.47917 16 7.71667 16 8C16 8.28333 15.9042 8.52083 15.7125 8.7125C15.5208 8.90417 15.2833 9 15 9H10V14C10 14.2833 9.90417 14.5208 9.7125 14.7125C9.52083 14.9042 9.28333 15 9 15C8.71667 15 8.47917 14.9042 8.2875 14.7125C8.09583 14.5208 8 14.2833 8 14V9Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a mail/envelope icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing an envelope,
 * allowing optional overrides for width, height, and color.
 *
 * @function mail
 * @param {Object} [options={}]
 * @param {number} [options.width=20] - Icon width attribute.
 * @param {number} [options.height=16] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the mail icon.
 */
function mail({ width = 20, height = 16, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 16",
    color,
    paths: [
      {
        d: "M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM18 4L10.525 8.675C10.4417 8.725 10.3542 8.7625 10.2625 8.7875C10.1708 8.8125 10.0833 8.825 10 8.825C9.91667 8.825 9.82917 8.8125 9.7375 8.7875C9.64583 8.7625 9.55833 8.725 9.475 8.675L2 4V14H18V4ZM10 7L18 2H2L10 7Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a lock icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a padlock,
 * commonly used to indicate secure or password-protected content.
 *
 * @function lock
 * @param {Object} [options={}]
 * @param {number} [options.width=16] - Icon width attribute.
 * @param {number} [options.height=21] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the lock icon.
 */
function lock({ width = 16, height = 21, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 16 21",
    color,
    paths: [
      {
        d: "M2 21C1.45 21 0.979167 20.8042 0.5875 20.4125C0.195833 20.0208 0 19.55 0 19V9C0 8.45 0.195833 7.97917 0.5875 7.5875C0.979167 7.19583 1.45 7 2 7H3V5C3 3.61667 3.4875 2.4375 4.4625 1.4625C5.4375 0.4875 6.61667 0 8 0C9.38333 0 10.5625 0.4875 11.5375 1.4625C12.5125 2.4375 13 3.61667 13 5V7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V19C16 19.55 15.8042 20.0208 15.4125 20.4125C15.0208 20.8042 14.55 21 14 21H2ZM2 19H14V9H2V19ZM8 16C8.55 16 9.02083 15.8042 9.4125 15.4125C9.80417 15.0208 10 14.55 10 14C10 13.45 9.80417 12.9792 9.4125 12.5875C9.02083 12.1958 8.55 12 8 12C7.45 12 6.97917 12.1958 6.5875 12.5875C6.19583 12.9792 6 13.45 6 14C6 14.55 6.19583 15.0208 6.5875 15.4125C6.97917 15.8042 7.45 16 8 16ZM5 7H11V5C11 4.16667 10.7083 3.45833 10.125 2.875C9.54167 2.29167 8.83333 2 8 2C7.16667 2 6.45833 2.29167 5.875 2.875C5.29167 3.45833 5 4.16667 5 5V7Z",
      },
    ],
  });
}
