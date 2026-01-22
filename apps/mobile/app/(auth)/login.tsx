import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../src/api/client";
import { useAuthStore } from "../../src/store/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useAuthStore((state) => state.setToken);

  const loginMutation = useMutation({
    mutationFn: async () => {
      return apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "user" })
      });
    },
    onSuccess: (data) => {
      setToken(data.token);
      Alert.alert("Bienvenido", "Inicio de sesión exitoso.");
    },
    onError: () => {
      Alert.alert("Error", "No se pudo iniciar sesión.");
    }
  });

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-slate-900 mb-6">Iniciar sesión</Text>
      <Text className="text-sm text-slate-600 mb-2">Correo</Text>
      <TextInput
        className="border border-slate-200 rounded-xl px-4 py-3 mb-4"
        placeholder="correo@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text className="text-sm text-slate-600 mb-2">Contraseña</Text>
      <TextInput
        className="border border-slate-200 rounded-xl px-4 py-3 mb-6"
        placeholder="******"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        className="bg-slate-900 py-3 rounded-xl"
        onPress={() => loginMutation.mutate()}
      >
        <Text className="text-center text-white text-base font-semibold">Ingresar</Text>
      </Pressable>
    </View>
  );
}
