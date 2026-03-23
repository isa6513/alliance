import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import {
  authForgotPassword,
  authMe,
  City,
  NotificationChannel,
  UpdateProfileDto,
  userMyLocation,
  userUpdate,
} from "@alliance/shared/client";
import { Features, isEnabled } from "@alliance/shared/lib/features";
import {
  hasSettingsChanges,
  NOTIFICATION_CHANNEL_OPTIONS,
  NotificationChannelOption,
} from "@alliance/shared/lib/settings";
import { useAuth } from "../../lib/AuthContext";
import Button, { ButtonColor } from "../../components/system/Button";
import Card, { CardStyle } from "../../components/system/Card";
import TimeZoneSelect from "../../components/forms/TimeZoneSelect";
import AwayRangesSection from "../../components/AwayRangesSection";
import { useMutation } from "@tanstack/react-query";
import { SimplePageTitle } from "../../components/system/SimplePageTitle";
import { colors } from "../../lib/style/colors";
import { cn } from "@alliance/shared/styles/util";
import KeyboardAwareScrollView from "../../components/KeyboardAwareScrollView";

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
};

function SettingsToggleRow({
  label,
  value,
  onChange,
  description,
}: SettingsToggleRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-start"
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
    >
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          true: colors.green,
          false: colors.switch.trackOff,
        }}
        ios_backgroundColor={colors.switch.trackOff}
      />
      <View className="ml-3 flex-1">
        <Text className="text-base text-zinc-900">{label}</Text>
        {description ? (
          <Text className="mt-1 text-sm text-zinc-500">{description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [location, setLocation] = useState<City | null>(null);
  const [editableUser, setEditableUser] = useState<UpdateProfileDto | null>(
    null,
  );
  const [initialUser, setInitialUser] = useState<UpdateProfileDto | null>(null);

  const [passwordResetMessage, setPasswordResetMessage] = useState<
    string | null
  >(null);

  // Modal states
  const [reminderChannelModalOpen, setReminderChannelModalOpen] =
    useState(false);

  const updateEditableUser = useCallback(
    (updates: Partial<UpdateProfileDto>) => {
      setEditableUser((prev: UpdateProfileDto | null) =>
        prev ? { ...prev, ...updates } : prev,
      );
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, [logout]);

  const hasChanges = useMemo(() => {
    return hasSettingsChanges(editableUser, initialUser);
  }, [editableUser, initialUser]);
  const showPushSettings = isEnabled(
    Features.PushNotifications,
    __DEV__ ? "development" : "production",
  );
  const reminderChannelOptions = useMemo<NotificationChannelOption[]>(() => {
    if (!showPushSettings) {
      return NOTIFICATION_CHANNEL_OPTIONS;
    }

    return [
      ...NOTIFICATION_CHANNEL_OPTIONS,
      { value: "push" as NotificationChannel, label: "Push" },
    ];
  }, [showPushSettings]);
  const selectedReminderChannelLabel = useMemo(() => {
    const selectedOption = reminderChannelOptions.find(
      (option) => option.value === editableUser?.preferredActionReminderChannel,
    );

    if (selectedOption) {
      return selectedOption.label;
    }

    if (editableUser?.preferredActionReminderChannel === "push") {
      return "Push";
    }

    return "Email";
  }, [editableUser?.preferredActionReminderChannel, reminderChannelOptions]);

  const forgotPassword = useMutation({
    mutationFn: (email: string) => authForgotPassword({ body: { email } }),
  });

  const handlePasswordReset = useCallback(async () => {
    setPasswordResetMessage(null);
    if (!user?.email) {
      return;
    }
    forgotPassword.mutate(user.email);
  }, [user?.email, forgotPassword]);

  const handleSave = useCallback(async (userPayload: UpdateProfileDto) => {
    setSaving(true);
    try {
      await userUpdate({
        body: { ...userPayload },
      });
      setInitialUser({ ...userPayload });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    authMe()
      .then((response: { data?: { user: UpdateProfileDto } }) => {
        if (response.data) {
          setEditableUser(response.data.user);
          setInitialUser(response.data.user);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    userMyLocation().then((locationResponse: { data?: City }) => {
      if (locationResponse.data) {
        const city = locationResponse.data;
        setLocation(city);
        const cityId = city.id;
        setEditableUser((prev: UpdateProfileDto | null) =>
          prev ? { ...prev, cityId } : { ...user, cityId },
        );
        setInitialUser((prev: UpdateProfileDto | null) =>
          prev ? { ...prev, cityId } : { ...user, cityId },
        );
      }
    });
  }, [user]);

  // Auto-save with debounce
  useEffect(() => {
    if (!editableUser || !initialUser || !hasChanges) return;

    const timeoutId = setTimeout(() => {
      handleSave(editableUser);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [editableUser, initialUser, hasChanges, handleSave]);

  if (loading) {
    return (
      <View className="flex-1 bg-white p-4">
        <Text className="text-2xl font-semibold mb-4">Settings</Text>
        <Text className="text-center text-zinc-500">
          Loading your account information...
        </Text>
      </View>
    );
  }

  if (!user || !editableUser) {
    return (
      <View className="flex-1 bg-white p-4">
        <Text className="text-center text-zinc-500">Not found</Text>
      </View>
    );
  }

  const inputClasses =
    "border border-zinc-200 rounded-lg bg-white px-3 py-3 text-base";

  return (
    <View className="flex-1 bg-white" testID="vr-settings-ready">
      <SimplePageTitle title="Settings">
        <Text className="text-sm text-zinc-500 mr-4">
          {saving
            ? "Saving..."
            : hasChanges
              ? "Unsaved changes"
              : "Changes saved"}
        </Text>
      </SimplePageTitle>
      <KeyboardAwareScrollView className="flex-1">
        <View className="bg-zinc-100 px-2 pb-8 pt-2 flex flex-col gap-2">
          {/* Profile Section */}
          <Card cardStyle={CardStyle.White}>
            <View className="gap-4">
              <View>
                <Text className="mb-1">
                  Name{" "}
                  {editableUser.anonymous && (
                    <Text className="text-gray-500 italic">(Not shown)</Text>
                  )}
                </Text>
                <TextInput
                  className={inputClasses}
                  value={editableUser.name ?? ""}
                  onChangeText={(text) => updateEditableUser({ name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.text.light}
                />
              </View>

              <View>
                <Text className="mb-1">Email</Text>
                <TextInput
                  className={cn(inputClasses, "opacity-60")}
                  value={user.email ?? ""}
                  editable={false}
                />
              </View>

              <View>
                <Text className="mb-1">Location</Text>
                <TextInput
                  className={inputClasses}
                  value={editableUser.customCityString ?? location?.name ?? ""}
                  onChangeText={(text) =>
                    updateEditableUser({ customCityString: text, cityId: null })
                  }
                  placeholder="Enter your city"
                  placeholderTextColor={colors.text.light}
                />
              </View>

              <View>
                <Text className="mb-1">Phone number</Text>
                <TextInput
                  className={inputClasses}
                  value={editableUser.phoneNumber ?? ""}
                  onChangeText={(text) =>
                    updateEditableUser({ phoneNumber: text })
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.text.light}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Card>

          {/* Show name / anonymous — toggle is "show my name" (green when on) */}
          <Card cardStyle={CardStyle.White}>
            <Text className="font-medium mb-2">Profile visibility</Text>
            <Text className="text-zinc-500 text-sm mb-4">
              When off, other members will not be able to see your name
              (anonymous).
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                updateEditableUser({
                  anonymous: !editableUser.anonymous,
                })
              }
              activeOpacity={0.7}
            >
              <Switch
                value={!editableUser.anonymous}
                onValueChange={(value) =>
                  updateEditableUser({ anonymous: !value })
                }
                trackColor={{
                  true: colors.green,
                  false: colors.switch.trackOff,
                }}
                ios_backgroundColor={colors.switch.trackOff}
              />
              <Text className="ml-3 text-base">
                Show my name to other members
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Notifications Section */}
          <Card cardStyle={CardStyle.White}>
            <Text className="text-2xl font-semibold mb-4">Notifications</Text>

            <View className="mb-4">
              <Text className="font-medium mb-2">
                Send action reminders via:
              </Text>
              <TouchableOpacity
                className={cn(
                  inputClasses,
                  "flex-row items-center justify-between",
                )}
                onPress={() => setReminderChannelModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text className="text-base text-zinc-900">
                  {selectedReminderChannelLabel}
                </Text>
                <ChevronDown size={18} color={colors.text.icon} />
              </TouchableOpacity>
            </View>

            <Text className="font-medium mb-2">
              Allowed notification channels:
            </Text>
            {!(
              editableUser.emailNotifsEnabled || editableUser.textNotifsEnabled
            ) && (
              <Text className="text-sm text-zinc-500 mb-2">
                You will not receive any notifications. Please keep a
                notification channel enabled if you need reminders to complete
                actions on time.
              </Text>
            )}

            <View className="gap-3 mb-4">
              <SettingsToggleRow
                label="Email"
                value={!!editableUser.emailNotifsEnabled}
                onChange={(value) =>
                  updateEditableUser({ emailNotifsEnabled: value })
                }
              />
              <SettingsToggleRow
                label="Text/SMS"
                value={!!editableUser.textNotifsEnabled}
                onChange={(value) =>
                  updateEditableUser({ textNotifsEnabled: value })
                }
              />
              {showPushSettings ? (
                <SettingsToggleRow
                  label="Push"
                  value={!!editableUser.pushNotifsEnabled}
                  onChange={(value) =>
                    updateEditableUser({ pushNotifsEnabled: value })
                  }
                />
              ) : null}
            </View>

            <View className="gap-3 mb-4">
              {user.leaderOfIds.length > 0 ? (
                <SettingsToggleRow
                  label="Receive reminders for group members with uncompleted tasks?"
                  value={!!editableUser.remindAboutUncompletedGroupMembers}
                  onChange={(value) =>
                    updateEditableUser({
                      remindAboutUncompletedGroupMembers: value,
                    })
                  }
                />
              ) : null}
              <SettingsToggleRow
                label="Allow notifications when you receive a reply in an ongoing action discussion?"
                value={!!editableUser.receiveReplyNotifications}
                onChange={(value) =>
                  updateEditableUser({
                    receiveReplyNotifications: value,
                  })
                }
              />
            </View>

            {showPushSettings ? (
              <>
                <Text className="font-medium mb-2 mt-4">
                  Receive push notifications for:
                </Text>
                <View className="gap-3 mb-4">
                  <SettingsToggleRow
                    label="Likes"
                    value={editableUser.pushesForLikes ?? false}
                    onChange={(value) =>
                      updateEditableUser({ pushesForLikes: value })
                    }
                  />
                  <SettingsToggleRow
                    label="Comments"
                    value={editableUser.pushesForComments ?? false}
                    onChange={(value) =>
                      updateEditableUser({ pushesForComments: value })
                    }
                  />
                  <SettingsToggleRow
                    label="Friend requests"
                    value={editableUser.pushesForFriendRequests ?? false}
                    onChange={(value) =>
                      updateEditableUser({ pushesForFriendRequests: value })
                    }
                  />
                  <SettingsToggleRow
                    label="Messages"
                    value={editableUser.pushesForMessages ?? false}
                    onChange={(value) =>
                      updateEditableUser({ pushesForMessages: value })
                    }
                  />
                </View>
              </>
            ) : null}

            <View className="mb-4">
              <Text className="font-medium mb-2">Preferred reminder time:</Text>
              <TextInput
                className={inputClasses}
                value={editableUser.preferredReminderTime ?? ""}
                onChangeText={(text) =>
                  updateEditableUser({ preferredReminderTime: text })
                }
                placeholder="HH:MM (e.g., 09:00)"
                placeholderTextColor={colors.text.light}
              />
            </View>

            <View>
              <Text className="font-medium mb-2">
                Your time zone for reminders:
              </Text>
              <TimeZoneSelect
                value={editableUser.timeZone}
                onChange={(tz) => updateEditableUser({ timeZone: tz })}
              />
            </View>
          </Card>

          {/* Groups Section */}
          {user.communities && user.communities.length > 0 && (
            <Card cardStyle={CardStyle.White}>
              <Text className="text-2xl font-semibold mb-4">Groups</Text>
              <Text className="mb-2">
                Contact info shared with your group lead:
              </Text>

              <View className="gap-3">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() =>
                    updateEditableUser({
                      shareEmailWithCommunityLead:
                        !editableUser.shareEmailWithCommunityLead,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Switch
                    value={!!editableUser.shareEmailWithCommunityLead}
                    onValueChange={(value) =>
                      updateEditableUser({
                        shareEmailWithCommunityLead: value,
                      })
                    }
                    trackColor={{
                      true: colors.green,
                      false: colors.switch.trackOff,
                    }}
                    ios_backgroundColor={colors.switch.trackOff}
                  />
                  <Text className="ml-3 text-base">Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() =>
                    updateEditableUser({
                      sharePhoneNumberWithCommunityLead:
                        !editableUser.sharePhoneNumberWithCommunityLead,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Switch
                    value={!!editableUser.sharePhoneNumberWithCommunityLead}
                    onValueChange={(value) =>
                      updateEditableUser({
                        sharePhoneNumberWithCommunityLead: value,
                      })
                    }
                    trackColor={{
                      true: colors.green,
                      false: colors.switch.trackOff,
                    }}
                    ios_backgroundColor={colors.switch.trackOff}
                  />
                  <Text className="ml-3 text-base">Phone number</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Away Periods Section */}
          <Card cardStyle={CardStyle.White}>
            <AwayRangesSection />
          </Card>

          {/* Privacy Section */}
          <Card cardStyle={CardStyle.White}>
            <Text className="text-2xl font-semibold mb-4">Privacy</Text>

            <Text className="mb-2">
              Some parts of your completed tasks can be visible to other
              members.
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                updateEditableUser({
                  formDataPreference:
                    editableUser.formDataPreference === "public"
                      ? "private"
                      : "public",
                })
              }
              activeOpacity={0.7}
            >
              <Switch
                value={editableUser.formDataPreference === "public"}
                onValueChange={(value) =>
                  updateEditableUser({
                    formDataPreference: value ? "public" : "private",
                  })
                }
                trackColor={{
                  true: colors.green,
                  false: colors.switch.trackOff,
                }}
                ios_backgroundColor={colors.switch.trackOff}
              />
              <Text className="ml-3 text-base">Default to visible</Text>
            </TouchableOpacity>
            <Text className="text-sm text-zinc-500 mt-2">
              You will still be able to control visibility for specific tasks.
            </Text>

            <View className="mt-6">
              <Button
                color={ButtonColor.Black}
                onPress={handlePasswordReset}
                disabled={forgotPassword.isPending}
                title={
                  forgotPassword.isPending
                    ? "Sending reset link..."
                    : "Reset password"
                }
              />
              {!passwordResetMessage && (
                <Text className="text-sm text-zinc-500 mt-2">
                  We&apos;ll send the reset link to{" "}
                  {user.email || "your account email"}.
                </Text>
              )}
              {passwordResetMessage && (
                <Text className="text-sm text-green-600 mt-2">
                  {passwordResetMessage}
                </Text>
              )}
              {forgotPassword.isError && (
                <Text className="text-sm text-red-700 mt-2">
                  {forgotPassword.error?.message}
                </Text>
              )}
            </View>
          </Card>

          {/* Logout */}
          <Button
            color={ButtonColor.Red}
            onPress={handleLogout}
            title="Log out"
          />
        </View>

        {/* Reminder Channel Modal */}
        <Modal
          visible={reminderChannelModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setReminderChannelModalOpen(false)}
        >
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white rounded-t-2xl p-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-zinc-900">
                  Reminder Channel
                </Text>
                <TouchableOpacity
                  onPress={() => setReminderChannelModalOpen(false)}
                >
                  <Text className="text-blue-600 font-medium">Close</Text>
                </TouchableOpacity>
              </View>
              {reminderChannelOptions.map(
                (option: NotificationChannelOption) => (
                  <TouchableOpacity
                    key={option.value}
                    className="py-3 flex-row items-center"
                    onPress={() => {
                      updateEditableUser({
                        preferredActionReminderChannel: option.value,
                      });
                      setReminderChannelModalOpen(false);
                    }}
                  >
                    <View
                      className={cn(
                        "w-6 h-6 rounded-full border mr-3 items-center justify-center",
                        editableUser.preferredActionReminderChannel ===
                          option.value
                          ? "border-green"
                          : "border-zinc-200",
                      )}
                    >
                      {editableUser.preferredActionReminderChannel ===
                        option.value && (
                        <View className="w-4 h-4 rounded-full bg-green" />
                      )}
                    </View>
                    <Text className="text-base text-zinc-800">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </View>
  );
}
