export function createBoostIcon(type, number) {
  switch (type) {
    case "mps":
      return `<?xml version="1.0" encoding="utf-8"?>
<svg
  width="50px"
  height="50px"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Plus icon -->
  <path d="M20 1C20 0.447715 20.4477 0 21 0C21.5523 0 22 0.447715 22 1V2H23C23.5523 2 24 2.44772 24 3C24 3.55228 23.5523 4 23 4H22V5C22 5.55228 21.5523 6 21 6C20.4477 6 20 5.55228 20 5V4H19C18.4477 4 18 3.55228 18 3C18 2.44772 18.4477 2 19 2H20V1Z" fill="limegreen"/>
  <!-- Incomplete circle -->
  <path d="M21.1936 8.07463C21.7016 7.85776 22.297 8.09138 22.4668 8.6169C23.145 10.7148 23.1792 12.9766 22.5523 15.1064C21.8308 17.5572 20.2788 19.6804 18.1626 21.1117C16.0464 22.5429 13.498 23.193 10.9548 22.9502C8.41165 22.7075 6.03225 21.5871 4.22503 19.7814C2.4178 17.9757 1.29545 15.5972 1.05062 13.0542C0.805783 10.5112 1.45373 7.96227 2.88325 5.84491C4.31277 3.72755 6.43471 2.17379 8.88488 1.4503C11.0142 0.821568 13.2759 0.853957 15.3744 1.53036"
    fill="none"
    stroke="lime"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <!-- Number -->
  <text
    x="12"
    y="13.5"
    text-anchor="middle"
    dominant-baseline="middle"
    font-size="10"
    font-weight="700"
    fill="lime"
    font-family="Arial, Helvetica, sans-serif"
  >
    ${number}
  </text>
</svg>
`;
  }
}
