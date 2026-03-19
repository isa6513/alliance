import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import Button from "../../components/system/Button";
import Input from "../../components/system/Input";
import Text from "../../components/system/Text";
import Card, { CardStyle } from "../../components/system/Card";

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
    <View style={styles.inner} className="flex flex-col bg-zinc-100">
      <View className="flex-1 pt-20 justify-start">
        <Text className="text-3xl font-semibold mb-6">The Alliance</Text>

        <Card cardStyle={CardStyle.White}>
          <View className="flex flex-col gap-y-6">
            <View>
              <Text className="mb-2">Email</Text>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            <View>
              <Text className="mb-2">Password</Text>
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Button
              onPress={handleLogin}
              disabled={isSubmitting || !email || !password}
              className="rounded-md w-full self-center py-4!"
            >
              <Text className="text-white text-base font-medium">Log in</Text>
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inner: {
    padding: 16,
    flex: 1,
  },
});

export default LoginScreen;
