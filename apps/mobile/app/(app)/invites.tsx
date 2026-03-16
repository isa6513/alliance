import { useCallback, useMemo } from "react";
import { ScrollView, TouchableOpacity, View, Linking } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useActionUpdates } from "@alliance/shared/lib/informationPage";
import Text from "../../components/system/Text";
import { colors } from "../../lib/style/colors";
import ActionUpdateCard from "../../components/ActionUpdateCard";
import { SimplePageTitle } from "../../components/system/SimplePageTitle";

const WEB_BASE_URL = "https://worldalliance.org"; //TODO

const resources = [
  {
    id: "guide",
    title: "Our guide",
    description: "describes how we work.",
    href: "/guide",
  },
  {
    id: "foundation",
    title: "Our foundation",
    description: "describes how we derived our priorities.",
    href: "/foundation",
  },
  {
    id: "governance",
    title: "Our governance",
    description: "describes office and member obligations.",
    href: "/governance",
  },
  {
    id: "faq",
    title: "Our FAQ",
    description: "answers common questions.",
    href: "/faq",
  },
  {
    id: "contact",
    title: "Email the office",
    description: "with questions, feedback, or ideas.",
    href: "mailto:contact@worldalliance.org",
  },
];

const normalizeResourceUrl = (href: string) => {
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return href;
  }
  return `${WEB_BASE_URL}${href}`;
};

export default function InvitesScreen() {
  return (
    <View className="flex-1 bg-white">
      <SimplePageTitle title="Invites" />
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-10 gap-y-6" />
      </ScrollView>
    </View>
  );
}
