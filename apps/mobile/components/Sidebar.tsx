import { View, TouchableOpacity, ScrollView } from "react-native";
import { usePathname, Route, useRouter } from "expo-router";
import {
  BookText,
  FileText,
  Globe,
  Layers,
  Search,
  Settings,
  X,
  User,
  UserPlus,
  QrCode,
} from "lucide-react-native";
import Text from "./system/Text";
import { colors } from "../lib/style/colors";
import { cn } from "@alliance/shared/styles/util";
import { useAppDrawer } from "../lib/AppDrawerContext";

type NavItem = {
  name: string;
  href: Route;
  icon: React.ElementType;
  matchPaths: string[];
};

const navItems: NavItem[] = [
  {
    name: "Actions",
    href: "/actions",
    icon: Layers,
    matchPaths: ["/actions", "/action"],
  },
  {
    name: "Information",
    href: "/information",
    icon: BookText,
    matchPaths: ["/information"],
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    matchPaths: ["/search"],
  },
  { name: "Activity", href: "/feed", icon: Globe, matchPaths: ["/feed"] },
  {
    name: "Invites",
    href: "/invites",
    icon: UserPlus,
    matchPaths: ["/invites"],
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    matchPaths: ["/profile"],
  },
  {
    name: "Contract",
    href: "/contract",
    icon: FileText,
    matchPaths: ["/contract"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    matchPaths: ["/settings"],
  },
];

export default function Sidebar() {
  const { closeDrawer } = useAppDrawer();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some((path) => {
      if (path === "/" || path === "") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(path);
    });
  };

  const handleNavigate = (href: Route) => {
    closeDrawer();
    router.replace(href);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: 48, paddingBottom: 0 }}
      style={{ backgroundColor: "#fafafa" }}
    >
      <View className="flex-1">
        {/* Close button */}
        <View className="flex-row justify-end px-4">
          <TouchableOpacity onPress={() => closeDrawer()} className="p-2">
            <X size={24} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={() => handleNavigate("/invites")}
            className="mb-3 self-start p-1 -ml-1"
            accessibilityRole="button"
            accessibilityLabel="Invites"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <QrCode size={26} color={colors.text.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigate("/")}>
            <Text
              className="uppercase text-xl font-bold"
              style={{ fontFamily: "Berlingske" }}
            >
              The Alliance
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-4">
          {navItems.map((item) => {
            const active = isActive(item.matchPaths);
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => handleNavigate(item.href)}
                className={cn(
                  "flex-row items-center px-3 py-2.5 rounded-lg mb-0.5",
                  active && "bg-zinc-200",
                )}
                activeOpacity={0.7}
              >
                <Icon
                  size={18}
                  color={active ? colors.green : colors.text.icon}
                />
                <Text
                  className={cn(
                    "ml-3 text-[17px]",
                    active ? "font-medium text-black" : "text-zinc-900",
                  )}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
