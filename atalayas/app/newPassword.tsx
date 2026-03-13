import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

export default function NewPassword() {
  return (
    <View style={globalStyles.containerOrange}>

      <Text style={globalStyles.title}>
        CREA UNA NUEVA CONTRASEÑA
      </Text>

      <View style={globalStyles.card}>

        <View style={globalStyles.form}>
          <Text>Nueva contraseña:</Text>
          <TextInput style={globalStyles.input} secureTextEntry />
        </View>

        <View style={globalStyles.form}>
          <Text>Repetir nueva contraseña:</Text>
          <TextInput style={globalStyles.input} secureTextEntry />
        </View>

        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={globalStyles.buttonText}>Confirmar</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}