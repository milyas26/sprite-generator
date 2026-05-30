import type { CharacterDNA } from "./types";

export function createEmptyDNA(overrides: Partial<CharacterDNA> = {}): CharacterDNA {
  return {
    prompt: "",
    name: "Untitled Character",
    race: "human",
    gender: "male",
    class: "adventurer",
    pov: "top-down",
    physical: {
      hair: { style: "", color: "" },
      eyes: { color: "", shape: "" },
      skin: { tone: "" },
      build: "",
      height: "",
    },
    equipment: {
      head: null,
      body: "",
      legs: "",
      mainHand: null,
      offHand: null,
      accessories: [],
    },
    style: {
      artStyle: "16bit",
      palette: [],
      detailLevel: "medium",
    },
    directions: {
      up: "",
      down: "",
      left: "",
      right: "",
    },
    tags: [],
    ...overrides,
  };
}
