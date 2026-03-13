import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

export default function RecoverPassword() {
  return (
    <View style={globalStyles.containerOrange}>

      <Text style={globalStyles.title}>RECUPERAR CONTRASEÑA</Text>

      <View style={globalStyles.card}>

        <Text style={globalStyles.textCenter}>
          Escriba su correo electrónico asociado
          para enviarle el código de recuperación.
        </Text>

        <View style={globalStyles.form}>
          <Text>Email:</Text>
          <TextInput style={globalStyles.input} />
        </View>

        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => router.push("/verifyCode")}
        >
          <Text style={globalStyles.buttonText}>Siguiente</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}