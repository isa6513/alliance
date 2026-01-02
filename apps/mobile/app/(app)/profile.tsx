import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faBell,
  faLock,
  faCog,
  faLanguage,
  faQuestionCircle,
  faInfoCircle,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../components/system";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.substring(0, 1).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.admin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faUser}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Edit Profile</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faBell}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Notifications</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faLock}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Privacy</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/user/settings")}
        >
          <FontAwesomeIcon
            icon={faCog}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Settings</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faLanguage}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Language</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faQuestionCircle}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Help & Support</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon
            icon={faInfoCircle}
            size={20}
            color="#0D1B2A"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>About</Text>
          <FontAwesomeIcon
            icon={faChevronRight}
            size={16}
            color="#666"
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0D1B2A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D1B2A",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 6,
  },
  adminText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 24,
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginVertical: 8,
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  menuIcon: {
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginVertical: 40,
    marginHorizontal: 20,
    backgroundColor: "#ff3b30",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
