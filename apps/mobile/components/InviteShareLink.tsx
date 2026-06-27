import { ShareUrlMineDto } from "@alliance/shared/client";
import { useReusableInvites } from "@alliance/shared/lib/useReusableInvites";
import { cn } from "@alliance/shared/styles/util";
import { Pencil } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Share, TouchableOpacity, View } from "react-native";
import { colors } from "../lib/style/colors";
import FormModal from "./forms/FormModal";
import Button, { ButtonColor, ButtonSize } from "./system/Button";
import Card, { CardStyle } from "./system/Card";
import Input from "./system/Input";
import Text, { FontWeight } from "./system/Text";

const REQUIRED_DELETE_TEXT = "DELETE";

export default function InviteShareLink() {
  const {
    links,
    isPending,
    isError,
    isCreating,
    createInvite,
    updateLabel,
    deleteInvite,
  } = useReusableInvites();
  const [labelDraft, setLabelDraft] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCreate = useCallback(() => {
    createInvite(labelDraft).then(
      () => setLabelDraft(""),
      () => Alert.alert("Error", "Failed to create invite link"),
    );
  }, [createInvite, labelDraft]);

  const handleShare = useCallback((link: ShareUrlMineDto) => {
    void Share.share(
      Platform.OS === "android"
        ? { message: link.url, title: "Alliance invite" }
        : { url: link.url, title: "Alliance invite" },
    );
  }, []);

  const handleSaveLabel = useCallback(
    (id: string, label: string) =>
      updateLabel({ id, label }).then(
        () => true,
        () => {
          Alert.alert("Error", "Failed to update label");
          return false;
        },
      ),
    [updateLabel],
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmText("");
    setPendingDeleteId(id);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setPendingDeleteId(null);
    setDeleteConfirmText("");
  }, []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    closeDeleteModal();
    void deleteInvite(id).catch(() =>
      Alert.alert("Error", "Failed to delete invite link"),
    );
  }, [pendingDeleteId, deleteInvite, closeDeleteModal]);

  const deleteConfirmed = deleteConfirmText.trim() === REQUIRED_DELETE_TEXT;

  return (
    <View className="gap-4">
      <Card cardStyle={CardStyle.White} className="rounded-xl">
        <View className="gap-4">
          <View className="gap-1">
            <Text
              className="text-lg text-zinc-900"
              weight={FontWeight.Semibold}
            >
              Invite multiple people
            </Text>
            <Text className="text-sm text-zinc-500">
              Create one invite link you can share with multiple people. Add a
              label to remember where you shared each one.
            </Text>
          </View>
          <Input
            placeholder="Label this link (optional) — e.g. Instagram bio"
            value={labelDraft}
            onChangeText={setLabelDraft}
            editable={!isCreating}
            containerClassName="gap-0"
          />
          <Button
            onPress={handleCreate}
            color={ButtonColor.Black}
            title={isCreating ? "Creating…" : "Create invite link"}
            disabled={isCreating}
            loading={isCreating}
          />
        </View>
      </Card>

      {isError ? (
        <Text className="text-sm text-red-500">
          Failed to load invite links
        </Text>
      ) : isPending ? (
        <Text className="text-sm text-zinc-500">Loading…</Text>
      ) : links.length === 0 ? (
        <Text className="text-center text-zinc-500 py-4">
          Your invite links will appear here once you create them.
        </Text>
      ) : (
        <View className="gap-3">
          <Text className="text-lg text-zinc-900" weight={FontWeight.Semibold}>
            Your invite links
          </Text>
          <View className="bg-white rounded-lg overflow-hidden border border-zinc-100">
            {links.map((link) => (
              <InviteLinkRow
                key={link.id}
                link={link}
                onShare={handleShare}
                onSaveLabel={handleSaveLabel}
                onDelete={handleDelete}
              />
            ))}
          </View>
        </View>
      )}

      <FormModal visible={pendingDeleteId !== null} onClose={closeDeleteModal}>
        <View className="gap-4">
          <View className="gap-1">
            <Text
              className="text-lg text-zinc-900"
              weight={FontWeight.Semibold}
            >
              Delete invite link?
            </Text>
            <Text className="text-sm text-zinc-500">
              Anyone you&apos;ve already shared it with won&apos;t be able to
              use it. Type {REQUIRED_DELETE_TEXT} to confirm.
            </Text>
          </View>
          <Input
            placeholder={`Type ${REQUIRED_DELETE_TEXT} to confirm`}
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            containerClassName="gap-0"
          />
          <View className="flex-row gap-2">
            <Button
              onPress={closeDeleteModal}
              color={ButtonColor.White}
              title="Cancel"
              className="flex-1"
            />
            <Button
              onPress={confirmDelete}
              color={ButtonColor.Red}
              title="Delete"
              disabled={!deleteConfirmed}
              className="flex-1"
            />
          </View>
        </View>
      </FormModal>
    </View>
  );
}

type InviteLinkRowProps = {
  link: ShareUrlMineDto;
  onShare: (link: ShareUrlMineDto) => void;
  onSaveLabel: (id: string, label: string) => Promise<boolean>;
  onDelete: (id: string) => void;
};

function InviteLinkRow({
  link,
  onShare,
  onSaveLabel,
  onDelete,
}: InviteLinkRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(link.label ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(link.label ?? "");
  }, [link.label, editing]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const ok = await onSaveLabel(link.id, draft);
    setSaving(false);
    if (ok) setEditing(false);
  }, [onSaveLabel, link.id, draft]);

  const handleCancel = useCallback(() => {
    setDraft(link.label ?? "");
    setEditing(false);
  }, [link.label]);

  return (
    <View className="border-b border-zinc-100 px-4 py-3 bg-white gap-2">
      {!link.duplicate ? (
        <Text
          className="text-base text-zinc-900"
          weight={FontWeight.Semibold}
          numberOfLines={1}
        >
          {link.label || "Primary invite"}
        </Text>
      ) : editing ? (
        <View className="gap-2">
          <Input
            placeholder="Label"
            value={draft}
            onChangeText={setDraft}
            editable={!saving}
            autoFocus
            containerClassName="gap-0"
          />
          <View className="flex-row gap-2">
            <Button
              onPress={handleSave}
              color={ButtonColor.Green}
              size={ButtonSize.Small}
              title={saving ? "Saving…" : "Save"}
              disabled={saving}
              loading={saving}
            />
            <Button
              onPress={handleCancel}
              color={ButtonColor.White}
              size={ButtonSize.Small}
              title="Cancel"
              disabled={saving}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setEditing(true)}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 self-start"
        >
          <Text
            className={cn(
              "text-base",
              link.label ? "text-zinc-900" : "italic text-zinc-400",
            )}
            weight={FontWeight.Semibold}
            numberOfLines={1}
          >
            {link.label || "Add a label"}
          </Text>
          <Pencil size={14} color={colors.text.icon} />
        </TouchableOpacity>
      )}

      <Text className="text-xs text-zinc-400 font-mono" numberOfLines={1}>
        {link.url}
      </Text>

      <View className="flex-row items-center justify-between mt-1">
        {!link.duplicate ? (
          <Text className="text-xs text-green" weight={FontWeight.Semibold}>
            Primary
          </Text>
        ) : (
          <View />
        )}
        <View className="flex-row items-center gap-2">
          <Button
            onPress={() => onShare(link)}
            color={ButtonColor.Outline}
            size={ButtonSize.Small}
            title="Share"
          />
          {link.duplicate && (
            <Button
              onPress={() => onDelete(link.id)}
              color={ButtonColor.Black}
              size={ButtonSize.Small}
              title="Delete"
            />
          )}
        </View>
      </View>
    </View>
  );
}
