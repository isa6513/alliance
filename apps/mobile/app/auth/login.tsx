import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import Button from "../../components/system/Button";
import Input from "../../components/system/Input";
import Text from "../../components/system/Text";
import { ArrowRight } from "lucide-react-native";

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.inner} className="flex flex-col pt-48">
      <View className="flex flex-col gap-y-6 bg-white">
        <View>
          <Text className="">Email</Text>
          <Input placeholder="Email" value={email} onChangeText={setEmail} textContentType="emailAddress" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoFocus />
        </View>
        <View>
          <Text className="">Password</Text>
          <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" keyboardType="default" autoCapitalize="none" autoCorrect={false} />
        </View>
        <Button onPress={handleLogin} disabled={isSubmitting || !email || !password} className="rounded-md w-[60%] self-center py-4!">
          <Text className="text-white text-base font-medium">Log in</Text>
          <ArrowRight size={20} color="white" />
        </Button>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
  },
  textInput: {
    height: 45,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 36,
    paddingLeft: 10,
  },
});

export default LoginScreen;
