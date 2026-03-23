import type {
  NotificationChannel,
  PublicFormResponseDefault,
  UpdateProfileDto,
} from "../client";

export type NotificationChannelOption = {
  value: NotificationChannel;
  label: string;
};

export type FormDataPreferenceOption = {
  value: PublicFormResponseDefault;
  label: string;
};

export const FORM_DATA_PREFERENCE_OPTIONS: FormDataPreferenceOption[] = [
  { value: "public", label: "Default to visible" },
  { value: "private", label: "Default to hidden" },
];

/**
 * Checks if there are unsaved changes between the editable user state and the initial state.
 */
export function hasSettingsChanges(
  editableUser: UpdateProfileDto | null,
  initialUser: UpdateProfileDto | null,
): boolean {
  if (!editableUser || !initialUser) {
    return false;
  }
  const keys = Object.keys(editableUser) as (keyof UpdateProfileDto)[];
  return keys.some((key) => editableUser[key] !== initialUser[key]);
}

/**
 * Helper to create a partial update for the user profile.
 */
export function updateEditableUserField<K extends keyof UpdateProfileDto>(
  prev: UpdateProfileDto | null,
  key: K,
  value: UpdateProfileDto[K],
): UpdateProfileDto | null {
  if (!prev) return prev;
  return { ...prev, [key]: value };
}
