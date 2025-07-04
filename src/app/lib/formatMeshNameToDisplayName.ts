function formatMeshNameToDisplayName(meshName: string): string {
  const prefixesToRemove = [
    "Lower_Extremity_Bones_",
    "Upper_Extremity_Bones_",
    "Pelvis_Bones_",
    "Skull_Bones_",
    "Spine_Bones_",
    "bones_",
    "arteries_",
    "veins_",
    "nerves_",
    "muscles_",
    "organs_",
  ];

  const suffixesToRemove = ["_L", "_R", "_001", "_002", "_003", "_004", "_005"];

  // Remove known prefixes
  for (const prefix of prefixesToRemove) {
    if (meshName.startsWith(prefix)) {
      meshName = meshName.slice(prefix.length);
      break;
    }
  }

  // Remove known suffixes
  for (const suffix of suffixesToRemove) {
    if (meshName.endsWith(suffix)) {
      meshName = meshName.slice(0, -suffix.length);
      break;
    }
  }

  // Convert _L or _R to (L) / (R)
  meshName = meshName.replace(/_L$/, " (L)").replace(/_R$/, " (R)");

  // Replace underscores with spaces and capitalize
  return meshName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default formatMeshNameToDisplayName;
