import { storage } from "../logic/storage.js";

const biscuitDisplay = document.getElementById("boosts-current-biscuits");
biscuitDisplay.textContent = storage.getBiscuits().toLocaleString();
