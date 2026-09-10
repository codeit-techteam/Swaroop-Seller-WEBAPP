export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const INDIAN_UNION_TERRITORIES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const INDIAN_STATE_VALUES = [
  ...INDIAN_STATES,
  ...INDIAN_UNION_TERRITORIES,
] as const;

export type IndianState = (typeof INDIAN_STATE_VALUES)[number];

export const INDIAN_STATE_OPTIONS = INDIAN_STATE_VALUES.map((name) => ({
  label: name,
  value: name,
}));

const INDIAN_STATE_SET = new Set<string>(INDIAN_STATE_VALUES);

/** Common codes, slugs, and abbreviations mapped to official names. */
const STATE_ALIASES: Record<string, IndianState> = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CT: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  UT: "Uttarakhand",
  WB: "West Bengal",
  AN: "Andaman and Nicobar Islands",
  CH: "Chandigarh",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  DD: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  JK: "Jammu and Kashmir",
  LA: "Ladakh",
  LD: "Lakshadweep",
  PY: "Puducherry",
  PONDI: "Puducherry",
  WEST_BENGAL: "West Bengal",
  TAMIL_NADU: "Tamil Nadu",
  UTTAR_PRADESH: "Uttar Pradesh",
  MADHYA_PRADESH: "Madhya Pradesh",
  ANDHRA_PRADESH: "Andhra Pradesh",
  ARUNACHAL_PRADESH: "Arunachal Pradesh",
  HIMACHAL_PRADESH: "Himachal Pradesh",
  JAMMU_AND_KASHMIR: "Jammu and Kashmir",
  NCT_OF_DELHI: "Delhi",
  NEW_DELHI: "Delhi",
  PONDICHERRY: "Puducherry",
  ORISSA: "Odisha",
};

export function isIndianState(value: string): value is IndianState {
  return INDIAN_STATE_SET.has(value);
}

export function normalizeIndianState(value: string): IndianState | "" {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isIndianState(trimmed)) return trimmed;

  const exact = INDIAN_STATE_VALUES.find(
    (name) => name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;

  const aliasKey = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  return STATE_ALIASES[aliasKey] ?? STATE_ALIASES[trimmed.toUpperCase()] ?? "";
}

export const PINCODE_LOOKUP: Record<
  string,
  { city: string; state: IndianState }
> = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "393002": { city: "Ankleshwar", state: "Gujarat" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400051": { city: "Mumbai", state: "Maharashtra" },
  "400703": { city: "Navi Mumbai", state: "Maharashtra" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "700107": { city: "Kolkata", state: "West Bengal" },
};
