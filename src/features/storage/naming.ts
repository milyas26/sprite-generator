export function buildStorageKey(characterId: string, filename: string): string {
  return `${characterId}/${filename}`;
}

export function buildSheetKey(characterId: string, version: number): string {
  return `${characterId}/sheet_v${version}.png`;
}

export function buildMetadataKey(characterId: string): string {
  return `${characterId}/metadata.json`;
}

export function buildLayerKey(characterId: string, layerName: string): string {
  return `${characterId}/layers/${layerName}.png`;
}

export function buildAnimationFrameKey(characterId: string, animationName: string, direction: string, frame: number): string {
  const padded = String(frame).padStart(3, "0");
  return `${characterId}/animations/${animationName}/${direction.toLowerCase()}_${padded}.png`;
}

export function buildSpritePackKey(characterId: string, animationName: string): string {
  return `${characterId}/sprite_packs/${animationName}.png`;
}

export function buildDirectionalSpritePackKey(characterId: string, animationName: string, direction: string): string {
  return `${characterId}/sprite_packs/${animationName}/${direction.toLowerCase()}.png`;
}

export function buildBodyPartKey(characterId: string, bodyPartName: string): string {
  return `${characterId}/parts/${bodyPartName}.png`;
}
