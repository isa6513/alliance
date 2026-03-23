import { View, TouchableOpacity, ScrollView } from "react-native";
import { usePathname, Route, useRouter } from "expo-router";
import {
  Bell,
  BookText,
  FileText,
  Globe,
  Layers,
  ListTodo,
  MessagesSquare,
  Search,
  Settings,
  X,
  User,
  UserPlus,
  Users,
  MessageSquare,
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

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "",
    items: [
      { name: "Tasks", href: "/", icon: ListTodo, matchPaths: ["/", ""] },
      {
        name: "Notifications",
        href: "/notifications",
        icon: Bell,
        matchPaths: ["/notifications"],
      },
    ],
  },
  {
    title: "Platform",
    items: [
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
    ],
  },
  {
    title: "Social",
    items: [
      { name: "Activity", href: "/feed", icon: Globe, matchPaths: ["/feed"] },
      {
        name: "Groups",
        href: "/groups",
        icon: Users,
        matchPaths: ["/groups"],
      },
      {
        name: "Messages",
        href: "/messages",
        icon: MessageSquare,
        matchPaths: ["/messages"],
      },
      {
        name: "Invites",
        href: "/invites",
        icon: UserPlus,
        matchPaths: ["/invites"],
      },
    ],
  },
  {
    title: "Profile",
    items: [
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
    ],
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
        <View className="flex-row justify-end px-4 mb-4">
          <TouchableOpacity onPress={() => closeDrawer()} className="p-2">
            <X size={24} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <TouchableOpacity
          onPress={() => handleNavigate("/")}
          className="px-6 mb-8"
        >
          <Text
            className="uppercase text-xl font-bold"
            style={{ fontFamily: "Berlingske" }}
          >
            The Alliance
          </Text>
        </TouchableOpacity>

        {/* Navigation sections */}
        <View className="px-4">
          {navSections.map((section, sectionIndex) => (
            <View
              key={section.title || `section-${sectionIndex}`}
              className={cn(
                "pb-4 mb-2",
                sectionIndex < navSections.length - 1 &&
                  "border-b border-zinc-200",
              )}
            >
              {section.items.map((item) => {
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
                        "ml-3",
                        active ? "font-medium" : "text-zinc-900",
                      )}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
