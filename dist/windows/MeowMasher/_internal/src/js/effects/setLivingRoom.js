import { storage } from "../logic/storage.js";

const clickerArea = document.querySelector(".clicker-area");
const livingRoomsDisplay = document.getElementById("living-rooms-number");

export function setLivingRoom() {
  let livingRoomIndex = storage.getLivingRoomIndex();
  let livingRoomAmount = storage.getNumberOfLivingRooms();

  clickerArea.style.backgroundImage = `url(src/assets/images/living-rooms/${livingRoomIndex}.jpg)`;
  livingRoomsDisplay.textContent = livingRoomAmount;
}
