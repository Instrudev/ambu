import { useRef, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../src/api/client";

export default function HomeScreen() {
  const [contador, setContador] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const emergenciaMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/incidents/emergency", {
        method: "POST",
        body: JSON.stringify({ lat: -12.0464, lng: -77.0428 })
      });
    },
    onSuccess: () => {
      Alert.alert("Emergencia enviada", "Un conductor será notificado pronto.");
    },
    onError: () => {
      Alert.alert("Error", "No se pudo enviar la emergencia.");
    }
  });

  const iniciarHold = () => {
    setContador(3);
    timerRef.current = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          emergenciaMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelarHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setContador(0);
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <Text className="text-2xl font-bold text-slate-900 mb-2">Emergencia inmediata</Text>
      <Text className="text-base text-slate-600 text-center mb-8">
        Mantén presionado 3 segundos para confirmar.
      </Text>

      <Pressable
        className="bg-red-500 px-10 py-6 rounded-2xl"
        onPressIn={iniciarHold}
        onPressOut={cancelarHold}
      >
        <Text className="text-white text-lg font-semibold">
          {contador > 0 ? `Confirmando en ${contador}...` : "Botón de emergencia"}
        </Text>
      </Pressable>
    </View>
  );
}
