const ICONS = {
  recyBin,
  editPencil,
  confTick,
  addCross,
  delCross,
  mail,
  lock,
  eye_open,
  eye_closed,
  person,
  join_logo,
  nav_summary,
  nav_add_task,
  nav_board,
  nav_contacts,
  prioUrgent,
  prioMedium,
  prioLow,
  editPencilBig,
  prioUrgentBig,
  confTickBig,
  phone,
  checkMark,
  checkBoxChecked,
  search,
  add,
  more_con,
};

/**
 * Generates an SVG string for an "eye open / visibility on" icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing an eye symbol,
 * commonly used to indicate visible content (e.g., show password).
 *
 * @function eye_open
 * @param {Object} [options={}]
 * @param {number} [options.width=25] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the open-eye icon.
 */
function eye_open({ width = 25, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 22 15",
    color,
    paths: [
      {
        d: "M10.825 12C12.075 12 13.1375 11.5625 14.0125 10.6875C14.8875 9.8125 15.325 8.75 15.325 7.5C15.325 6.25 14.8875 5.1875 14.0125 4.3125C13.1375 3.4375 12.075 3 10.825 3C9.575 3 8.5125 3.4375 7.6375 4.3125C6.7625 5.1875 6.325 6.25 6.325 7.5C6.325 8.75 6.7625 9.8125 7.6375 10.6875C8.5125 11.5625 9.575 12 10.825 12ZM10.825 10.2C10.075 10.2 9.4375 9.9375 8.9125 9.4125C8.3875 8.8875 8.125 8.25 8.125 7.5C8.125 6.75 8.3875 6.1125 8.9125 5.5875C9.4375 5.0625 10.075 4.8 10.825 4.8C11.575 4.8 12.2125 5.0625 12.7375 5.5875C13.2625 6.1125 13.525 6.75 13.525 7.5C13.525 8.25 13.2625 8.8875 12.7375 9.4125C12.2125 9.9375 11.575 10.2 10.825 10.2ZM10.825 15C8.50833 15 6.39167 14.3875 4.475 13.1625C2.55833 11.9375 1.10833 10.2833 0.125 8.2C0.075 8.11667 0.0416667 8.0125 0.025 7.8875C0.00833333 7.7625 0 7.63333 0 7.5C0 7.36667 0.00833333 7.2375 0.025 7.1125C0.0416667 6.9875 0.075 6.88333 0.125 6.8C1.10833 4.71667 2.55833 3.0625 4.475 1.8375C6.39167 0.6125 8.50833 0 10.825 0C13.1417 0 15.2583 0.6125 17.175 1.8375C19.0917 3.0625 20.5417 4.71667 21.525 6.8C21.575 6.88333 21.6083 6.9875 21.625 7.1125C21.6417 7.2375 21.65 7.36667 21.65 7.5C21.65 7.63333 21.6417 7.7625 21.625 7.8875C21.6083 8.0125 21.575 8.11667 21.525 8.2C20.5417 10.2833 19.0917 11.9375 17.175 13.1625C15.2583 14.3875 13.1417 15 10.825 15ZM10.825 13C12.7083 13 14.4375 12.5042 16.0125 11.5125C17.5875 10.5208 18.7917 9.18333 19.625 7.5C18.7917 5.81667 17.5875 4.47917 16.0125 3.4875C14.4375 2.49583 12.7083 2 10.825 2C8.94167 2 7.2125 2.49583 5.6375 3.4875C4.0625 4.47917 2.85833 5.81667 2.025 7.5C2.85833 9.18333 4.0625 10.5208 5.6375 11.5125C7.2125 12.5042 8.94167 13 10.825 13Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for an "eye closed / visibility off" icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a crossed-out
 * eye, typically used to indicate hidden or masked content (e.g., password).
 *
 * @function eye_closed
 * @param {Object} [options={}]
 * @param {number} [options.width=25] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the closed-eye icon.
 */
function eye_closed({ width = 25, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 22 15",
    color,
    paths: [
      {
        d: "M14.925 10.075L13.475 8.625C13.625 7.84167 13.4 7.10833 12.8 6.425C12.2 5.74167 11.425 5.475 10.475 5.625L9.025 4.175C9.30833 4.04167 9.59583 3.94167 9.8875 3.875C10.1792 3.80833 10.4917 3.775 10.825 3.775C12.075 3.775 13.1375 4.2125 14.0125 5.0875C14.8875 5.9625 15.325 7.025 15.325 8.275C15.325 8.60833 15.2917 8.92083 15.225 9.2125C15.1583 9.50417 15.0583 9.79167 14.925 10.075ZM18.125 13.225L16.675 11.825C17.3083 11.3417 17.8708 10.8125 18.3625 10.2375C18.8542 9.6625 19.275 9.00833 19.625 8.275C18.7917 6.59167 17.5958 5.25417 16.0375 4.2625C14.4792 3.27083 12.7417 2.775 10.825 2.775C10.3417 2.775 9.86667 2.80833 9.4 2.875C8.93333 2.94167 8.475 3.04167 8.025 3.175L6.475 1.625C7.15833 1.34167 7.85833 1.12917 8.575 0.9875C9.29167 0.845833 10.0417 0.775 10.825 0.775C13.2083 0.775 15.35 1.40417 17.25 2.6625C19.15 3.92083 20.575 5.55833 21.525 7.575C21.575 7.65833 21.6083 7.7625 21.625 7.8875C21.6417 8.0125 21.65 8.14167 21.65 8.275C21.65 8.40833 21.6375 8.5375 21.6125 8.6625C21.5875 8.7875 21.5583 8.89167 21.525 8.975C21.1417 9.825 20.6625 10.6083 20.0875 11.325C19.5125 12.0417 18.8583 12.675 18.125 13.225ZM17.925 18.675L14.425 15.225C13.8417 15.4083 13.2542 15.5458 12.6625 15.6375C12.0708 15.7292 11.4583 15.775 10.825 15.775C8.44167 15.775 6.3 15.1458 4.4 13.8875C2.5 12.6292 1.075 10.9917 0.125 8.975C0.075 8.89167 0.0416667 8.7875 0.025 8.6625C0.00833333 8.5375 0 8.40833 0 8.275C0 8.14167 0.00833333 8.01667 0.025 7.9C0.0416667 7.78333 0.075 7.68333 0.125 7.6C0.475 6.85 0.891667 6.15833 1.375 5.525C1.85833 4.89167 2.39167 4.30833 2.975 3.775L0.9 1.675C0.716667 1.49167 0.625 1.2625 0.625 0.9875C0.625 0.7125 0.725 0.475 0.925 0.275C1.10833 0.0916667 1.34167 0 1.625 0C1.90833 0 2.14167 0.0916667 2.325 0.275L19.325 17.275C19.5083 17.4583 19.6042 17.6875 19.6125 17.9625C19.6208 18.2375 19.525 18.475 19.325 18.675C19.1417 18.8583 18.9083 18.95 18.625 18.95C18.3417 18.95 18.1083 18.8583 17.925 18.675ZM4.375 5.175C3.89167 5.60833 3.45 6.08333 3.05 6.6C2.65 7.11667 2.30833 7.675 2.025 8.275C2.85833 9.95833 4.05417 11.2958 5.6125 12.2875C7.17083 13.2792 8.90833 13.775 10.825 13.775C11.1583 13.775 11.4833 13.7542 11.8 13.7125C12.1167 13.6708 12.4417 13.625 12.775 13.575L11.875 12.625C11.6917 12.675 11.5167 12.7125 11.35 12.7375C11.1833 12.7625 11.0083 12.775 10.825 12.775C9.575 12.775 8.5125 12.3375 7.6375 11.4625C6.7625 10.5875 6.325 9.525 6.325 8.275C6.325 8.09167 6.3375 7.91667 6.3625 7.75C6.3875 7.58333 6.425 7.40833 6.475 7.225L4.375 5.175Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a person/user icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a user avatar
 * (head and shoulders), allowing optional overrides for width, height, and color.
 *
 * @function person
 * @param {Object} [options={}]
 * @param {number} [options.width=24] - Icon width attribute.
 * @param {number} [options.height=24] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the person icon.
 */
function person({ width = 24, height = 24, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 16 16",
    color,
    paths: [
      {
        d: "M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM14 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V14C16 14.55 15.8042 15.0208 15.4125 15.4125C15.0208 15.8042 14.55 16 14 16ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z",
      },
    ],
  });
}

/**
 * Generates the SVG markup for the JOIN application logo.
 *
 * Wraps {@link iconSvg} with predefined path data representing the full JOIN
 * brand mark, including the stylized "J" symbol and accompanying lettering.
 * Allows optional overrides for width, height, and base color.
 *
 * @function join_logo
 * @param {Object} [options={}]
 * @param {number} [options.width=101] - Logo width attribute.
 * @param {number} [options.height=122] - Logo height attribute.
 * @param {string} [options.color="var(--white-text-color)"] - Default fill color applied to logo paths.
 * @returns {string} SVG markup string for the JOIN logo.
 */
function join_logo({ width = 101, height = 122, color = "var(--white-text-color)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 101 122",
    color,
    paths: [
      { d: "M71.672 0H49.5142V25.4923H71.672V0Z" },
      {
        d: "M49.5142 46.2251H71.6721V82.1779C71.7733 90.8292 69.3112 99.3153 64.5986 106.557C59.9455 113.594 50.963 121.966 34.3446 121.966C16.2434 121.966 5.69286 113.406 0 108.715L13.9765 91.4743C19.533 96.0112 24.885 99.7435 34.4299 99.7435C41.6567 99.7435 44.5372 96.7988 46.2247 94.2307C48.5186 90.6637 49.7052 86.4923 49.6335 82.2464L49.5142 46.2251Z",
      },
      { d: "M38.2137 30.1318H16.0559V52.3884H38.2137V30.1318Z", fill: "var(--light-blue)" },
      {
        d: "M83.2795 111.522C83.2795 116.265 80.8762 118.815 77.5184 118.815C74.1607 118.815 71.9619 115.785 71.9619 111.762C71.9619 107.739 74.2288 104.554 77.7059 104.554C81.183 104.554 83.2795 107.687 83.2795 111.522ZM74.5356 111.711C74.5356 114.57 75.6776 116.675 77.6377 116.675C79.5978 116.675 80.7057 114.45 80.7057 111.539C80.7057 108.988 79.6831 106.592 77.6377 106.592C75.5924 106.592 74.5356 108.903 74.5356 111.711Z",
      },
      { d: "M87.6768 104.76V118.593H85.2224V104.76H87.6768Z" },
      {
        d: "M90.3357 118.593V104.76H93.0628L95.9945 110.461C96.7492 111.952 97.4206 113.483 98.0057 115.049C97.8523 113.337 97.7841 111.368 97.7841 109.177V104.76H100.034V118.593H97.4944L94.5286 112.772C93.7434 111.243 93.0435 109.671 92.4322 108.064C92.4322 109.776 92.5515 111.711 92.5515 114.09V118.576L90.3357 118.593Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for the navigation "Summary" icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a dashboard-style
 * layout with multiple panels, typically used for overview or summary pages.
 *
 * @function nav_summary
 * @param {Object} [options={}]
 * @param {number} [options.width=25] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the navigation summary icon.
 */
function nav_summary({ width = 25, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 25 25",
    color,
    paths: [
      {
        d: "M22.7273 0H2.27273H2C0.89543 0 0 0.895729 0 2.0003C0 2.18009 0 2.30746 0 2.33997V22.7945V23C0 24.1046 0.895724 25 2.00029 25C2.14377 25 2.24401 25 2.27272 25H22.7273C22.756 25 22.8562 25 22.9997 25C24.1043 25 25 24.1041 25 22.9995C25 22.8927 25 22.8188 25 22.7945V2.33994C25 2.30744 25 2.18008 25 2.0003C25 0.895727 24.1043 0 22.9997 0C22.8562 0 22.756 0 22.7273 0ZM14.7727 22.7945H2.27273V13.7036H14.7727V22.7945ZM14.7727 11.4309H2.27273V2.33997L14.7727 2.33994V11.4309ZM22.7273 22.7945H17.0455V2.33997H22.7273V22.7945Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for the navigation "Add Task" icon.
 *
 * Wraps {@link iconSvg} with predefined path data representing a task/document
 * with a pencil/edit indicator, typically used in navigation menus.
 *
 * @function nav_add_task
 * @param {Object} [options={}]
 * @param {number} [options.width=25] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the navigation add-task icon.
 */
function nav_add_task({ width = 25, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 25 25",
    color,
    paths: [
      {
        d: "M2.43902 25.0305C1.76829 25.0305 1.19411 24.7917 0.716463 24.314C0.238821 23.8364 0 23.2622 0 22.5915V5.51829C0 4.84756 0.238821 4.27337 0.716463 3.79573C1.19411 3.31809 1.76829 3.07927 2.43902 3.07927H13.3232L10.8841 5.51829H2.43902V22.5915H19.5122V14.1159L21.9512 11.6768V22.5915C21.9512 23.2622 21.7124 23.8364 21.2348 24.314C20.7571 24.7917 20.1829 25.0305 19.5122 25.0305H2.43902ZM16.0671 3.78049L17.8049 5.4878L9.7561 13.5366V15.2744H11.4634L19.5427 7.19512L21.2805 8.90244L13.2012 16.9817C12.9776 17.2053 12.7185 17.3831 12.4238 17.5152C12.1291 17.6474 11.8191 17.7134 11.4939 17.7134H8.53659C8.19106 17.7134 7.90142 17.5965 7.66768 17.3628C7.43394 17.1291 7.31707 16.8394 7.31707 16.4939V13.5366C7.31707 13.2114 7.37805 12.9014 7.5 12.6067C7.62195 12.312 7.79472 12.0528 8.01829 11.8293L16.0671 3.78049ZM21.2805 8.90244L16.0671 3.78049L19.1159 0.731707C19.6037 0.243902 20.188 0 20.8689 0C21.5498 0 22.124 0.243902 22.5915 0.731707L24.2988 2.46951C24.7663 2.93699 25 3.5061 25 4.17683C25 4.84756 24.7663 5.41667 24.2988 5.88415L21.2805 8.90244Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for the navigation "board" icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function nav_board
 * @param {Object} [options={}]
 * @param {number} [options.width=32] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon paths.
 * @returns {string} SVG markup string for the board navigation icon.
 */
function nav_board({ width = 32, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 32 25",
    color,
    paths: [
      {
        d: "M22.727 2.27273L22.727 22.7271C22.7264 23.3296 22.4868 23.9074 22.0607 24.3334C21.6346 24.7595 21.0569 24.9992 20.4543 24.9998L15.9089 24.9998C15.3063 24.9992 14.7286 24.7595 14.3025 24.3334C13.8765 23.9074 13.6368 23.3296 13.6362 22.7271L13.6362 2.27273C13.6368 1.67015 13.8765 1.09243 14.3025 0.666347C14.7286 0.240262 15.3063 0.000623034 15.9089 2.02854e-05L20.4543 2.00867e-05C21.0569 0.000622783 21.6346 0.240262 22.0607 0.666347C22.4868 1.09243 22.7264 1.67015 22.727 2.27273ZM15.9089 22.7271L20.4543 22.7271L20.4543 2.27273L15.9089 2.27273L15.9089 22.7271ZM15.9089 2.27273L15.9089 22.7271C15.9083 23.3296 15.6687 23.9073 15.2426 24.3334C14.8165 24.7595 14.2388 24.9991 13.6362 24.9997L9.09081 24.9997C8.48824 24.9991 7.91052 24.7595 7.48443 24.3334C7.05835 23.9073 6.81871 23.3296 6.81811 22.727L6.81811 2.2727C6.81871 1.67013 7.05835 1.09241 7.48443 0.666322C7.91052 0.240238 8.48824 0.000602351 9.09081 -3.97372e-07L13.6362 -5.96058e-07C14.2388 0.0006021 14.8165 0.240238 15.2426 0.666322C15.6687 1.09241 15.9083 1.67015 15.9089 2.27273ZM9.09081 22.727L13.6362 22.7271L13.6362 2.27273L9.09081 2.2727L9.09081 22.727ZM9.09081 2.2727L9.09081 22.727C9.09021 23.3296 8.85057 23.9073 8.42449 24.3334C7.99841 24.7595 7.42068 24.9991 6.81811 24.9997L2.2727 24.9997C1.67013 24.9991 1.09241 24.7595 0.666324 24.3334C0.24024 23.9073 0.000601599 23.3296 -9.93547e-08 22.727L-9.93442e-07 2.2727C0.000600652 1.67013 0.240239 1.09241 0.666323 0.666323C1.09241 0.240238 1.67013 0.000602649 2.2727 -9.9343e-08L6.81811 -2.98029e-07C7.42068 0.000602398 7.9984 0.240238 8.42449 0.666322C8.85057 1.09241 9.09021 1.67013 9.09081 2.2727ZM2.2727 22.727L6.81811 22.727L6.81811 2.2727L2.2727 2.2727L2.2727 22.727Z",
      },
      {
        d: "M29.5451 2.27298L29.5451 22.7273C29.5445 23.3299 29.3049 23.9076 28.8788 24.3337C28.4527 24.7598 27.875 24.9994 27.2724 25L22.727 25C22.1245 24.9994 21.5467 24.7598 21.1207 24.3337C20.6946 23.9076 20.4549 23.3296 20.4543 22.7271L20.4543 2.27273C20.4549 1.67015 20.6946 1.09268 21.1207 0.666598C21.5467 0.240514 22.1245 0.000876413 22.727 0.000273665L27.2724 0.000273466C27.875 0.000876162 28.4527 0.240514 28.8788 0.666598C29.3049 1.09268 29.5445 1.6704 29.5451 2.27298ZM22.727 22.7271L27.2724 22.7273L27.2724 2.27298L22.727 2.27273L22.727 22.7271Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for the navigation "contacts" icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data,
 * allowing optional overrides for width, height, and color.
 *
 * @function nav_contacts
 * @param {Object} [options={}]
 * @param {number} [options.width=25] - Icon width attribute.
 * @param {number} [options.height=25] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the contacts navigation icon.
 */
function nav_contacts({ width = 25, height = 25, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 25 25",
    color,
    paths: [
      {
        d: "M11.25 20C10.0833 20 8.96875 20.1823 7.90625 20.5469C6.84375 20.9115 5.875 21.4583 5 22.1875V22.5H17.5V22.1875C16.625 21.4583 15.6562 20.9115 14.5938 20.5469C13.5312 20.1823 12.4167 20 11.25 20ZM2.5 21.0625C3.625 19.9583 4.93229 19.0885 6.42188 18.4531C7.91146 17.8177 9.52083 17.5 11.25 17.5C12.9792 17.5 14.5885 17.8177 16.0781 18.4531C17.5677 19.0885 18.875 19.9583 20 21.0625V5H2.5V21.0625ZM11.25 15C10.0417 15 9.01042 14.5729 8.15625 13.7188C7.30208 12.8646 6.875 11.8333 6.875 10.625C6.875 9.41667 7.30208 8.38542 8.15625 7.53125C9.01042 6.67708 10.0417 6.25 11.25 6.25C12.4583 6.25 13.4896 6.67708 14.3438 7.53125C15.1979 8.38542 15.625 9.41667 15.625 10.625C15.625 11.8333 15.1979 12.8646 14.3438 13.7188C13.4896 14.5729 12.4583 15 11.25 15ZM11.25 12.5C11.7708 12.5 12.2135 12.3177 12.5781 11.9531C12.9427 11.5885 13.125 11.1458 13.125 10.625C13.125 10.1042 12.9427 9.66146 12.5781 9.29688C12.2135 8.93229 11.7708 8.75 11.25 8.75C10.7292 8.75 10.2865 8.93229 9.92188 9.29688C9.55729 9.66146 9.375 10.1042 9.375 10.625C9.375 11.1458 9.55729 11.5885 9.92188 11.9531C10.2865 12.3177 10.7292 12.5 11.25 12.5ZM2.5 25C1.8125 25 1.22396 24.7552 0.734375 24.2656C0.244792 23.776 0 23.1875 0 22.5V5C0 4.3125 0.244792 3.72396 0.734375 3.23438C1.22396 2.74479 1.8125 2.5 2.5 2.5H3.75V0H6.25V2.5H16.25V0H18.75V2.5H20C20.6875 2.5 21.276 2.74479 21.7656 3.23438C22.2552 3.72396 22.5 4.3125 22.5 5V22.5C22.5 23.1875 22.2552 23.776 21.7656 24.2656C21.276 24.7552 20.6875 25 20 25H2.5Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for a checkmark icon.
 *
 * Wraps {@link iconSvg} with default dimensions and path data, allowing optional
 * overrides for width, height, and color.
 *
 * @function checkMark
 * @param {Object} [options={}]
 * @param {number} [options.width=15] - Icon width attribute.
 * @param {number} [options.height=11] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon path.
 * @returns {string} SVG markup string for the checkmark icon.
 */
function checkMark({ width = 15, height = 11, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 15 11",
    color,
    paths: [
      {
        d: "M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z",
      },
    ],
  });
}

/**
 * Generates the SVG markup for an unchecked checkbox icon.
 *
 * Returns a static SVG string containing the checkbox outline.
 *
 * @function checkBoxUnchecked
 * @returns {string} SVG markup string for the unchecked checkbox icon.
 */
function checkBoxUnchecked() {
  return `
        <svg class="checkbox_unchecked" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="3" stroke="var(--blue)" stroke-width="2"/>
      </svg>
  `;
}

/**
 * Generates an SVG string for a checked checkbox icon.
 *
 * Wraps {@link iconSvg} with default dimensions and a default color token, and renders
 * the box outline plus checkmark via path data.
 *
 * @function checkBoxChecked
 * @param {Object} [options={}]
 * @param {number} [options.width=18] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color="var(--nav-icon)"] - Fill color for the icon paths.
 * @returns {string} SVG markup string for the checked checkbox icon.
 */
function checkBoxChecked({ width = 18, height = 18, color = "var(--nav-icon)" } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 18 18",
    color,
    paths: [{ d: "M17 8V14C17 15.6569 15.6569 17 14 17H4C2.34315 17 1 15.6569 1 14V4C1 2.34315 2.34315 1 4 1H12" }, { d: "M5 9L9 13L17 1.5" }],
  });
}

/**
 * Generates an SVG string for a "search" (magnifying glass) icon.
 *
 * Wraps {@link iconSvg} with default dimensions, viewBox, and path data, allowing
 * optional overrides for width, height, and color.
 *
 * @function search
 * @param {Object} [options={}]
 * @param {number} [options.width=18] - Icon width attribute.
 * @param {number} [options.height=18] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the search icon.
 */
function search({ width = 18, height = 18, color } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 20 20",
    color,
    paths: [
      {
        d: "M6.50185 13.0037C4.68467 13.0037 3.14673 12.3744 1.88804 11.1157C0.629346 9.85697 0 8.31903 0 6.50185C0 4.68467 0.629346 3.14673 1.88804 1.88804C3.14673 0.629346 4.68467 0 6.50185 0C8.31903 0 9.85697 0.629346 11.1157 1.88804C12.3744 3.14673 13.0037 4.68467 13.0037 6.50185C13.0037 7.23539 12.887 7.92725 12.6536 8.57744C12.4202 9.22762 12.1034 9.80279 11.7033 10.3029L17.3049 15.9045C17.4883 16.0879 17.58 16.3213 17.58 16.6047C17.58 16.8881 17.4883 17.1215 17.3049 17.3049C17.1215 17.4883 16.8881 17.58 16.6047 17.58C16.3213 17.58 16.0879 17.4883 15.9045 17.3049L10.3029 11.7033C9.80279 12.1034 9.22762 12.4202 8.57744 12.6536C7.92725 12.887 7.23539 13.0037 6.50185 13.0037ZM6.50185 11.0031C7.7522 11.0031 8.81501 10.5655 9.69026 9.69026C10.5655 8.81501 11.0031 7.7522 11.0031 6.50185C11.0031 5.25149 10.5655 4.18869 9.69026 3.31344C8.81501 2.43819 7.7522 2.00057 6.50185 2.00057C5.25149 2.00057 4.18869 2.43819 3.31344 3.31344C2.43819 4.18869 2.00057 5.25149 2.00057 6.50185C2.00057 7.7522 2.43819 8.81501 3.31344 9.69026C4.18869 10.5655 5.25149 11.0031 6.50185 11.0031Z",
      },
    ],
  });
}

/**
 * Generates an SVG string for an "add" (plus) icon.
 *
 * Wraps {@link iconSvg} with default dimensions and path data, allowing optional
 * overrides for width, height, and color.
 *
 * @function add
 * @param {Object} [options={}]
 * @param {number} [options.width=19] - Icon width attribute.
 * @param {number} [options.height=19] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the add icon.
 */
function add({ width = 19, height = 19, color } = {}) {
  return iconSvg({ width, height, viewBox: "0 0 18 18", color, paths: [{ d: "M8 10.6667H0V8H8V0H10.6667V8H18.6667V10.6667H10.6667V18.6667H8V10.6667Z" }] });
}

/**
 * Generates an SVG string for the "more" (vertical ellipsis) icon.
 *
 * Wraps {@link iconSvg} with default sizing and path data, allowing optional
 * overrides for width, height, and fill color.
 *
 * @function more_con
 * @param {Object} [options={}]
 * @param {number} [options.width=5] - Icon width attribute.
 * @param {number} [options.height=21] - Icon height attribute.
 * @param {string} [options.color] - Optional fill color (defaults to `currentColor` in {@link iconSvg}).
 * @returns {string} SVG markup string for the icon.
 */
function more_con({ width = 5, height = 21, color } = {}) {
  return iconSvg({
    width,
    height,
    viewBox: "0 0 19 19",
    color,
    paths: [
      {
        d: "M2.66667 21.3333C1.93333 21.3333 1.30556 21.0722 0.783333 20.55C0.261111 20.0278 0 19.4 0 18.6667C0 17.9333 0.261111 17.3056 0.783333 16.7833C1.30556 16.2611 1.93333 16 2.66667 16C3.4 16 4.02778 16.2611 4.55 16.7833C5.07222 17.3056 5.33333 17.9333 5.33333 18.6667C5.33333 19.4 5.07222 20.0278 4.55 20.55C4.02778 21.0722 3.4 21.3333 2.66667 21.3333ZM2.66667 13.3333C1.93333 13.3333 1.30556 13.0722 0.783333 12.55C0.261111 12.0278 0 11.4 0 10.6667C0 9.93333 0.261111 9.30556 0.783333 8.78333C1.30556 8.26111 1.93333 8 2.66667 8C3.4 8 4.02778 8.26111 4.55 8.78333C5.07222 9.30556 5.33333 9.93333 5.33333 10.6667C5.33333 11.4 5.07222 12.0278 4.55 12.55C4.02778 13.0722 3.4 13.3333 2.66667 13.3333ZM2.66667 5.33333C1.93333 5.33333 1.30556 5.07222 0.783333 4.55C0.261111 4.02778 0 3.4 0 2.66667C0 1.93333 0.261111 1.30556 0.783333 0.783333C1.30556 0.261111 1.93333 0 2.66667 0C3.4 0 4.02778 0.261111 4.55 0.783333C5.07222 1.30556 5.33333 1.93333 5.33333 2.66667C5.33333 3.4 5.07222 4.02778 4.55 4.55C4.02778 5.07222 3.4 5.33333 2.66667 5.33333Z",
      },
    ],
  });
}
