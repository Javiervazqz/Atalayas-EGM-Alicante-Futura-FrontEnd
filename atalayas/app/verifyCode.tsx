import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

export default function VerifyCode() {
  return (
    <View style={globalStyles.containerOrange}>

      <Text style={globalStyles.title}>INSERTA EL CÓDIGO</Text>

      <View style={globalStyles.card}>

        <Text style={globalStyles.textCenter}>
          Introduzca el código que le hemos enviado
          a su correo electrónico para verificar que eres tú.
        </Text>

        <View style={globalStyles.form}>
          <Text>Código de verificación:</Text>
          <TextInput style={globalStyles.input} />
        </View>

        <Text
          style={{ textDecorationLine: "underline", marginTop: 10 }}
        >
          Reenviar código
        </Text>

        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => router.push("/newPassword")}
        >
          <Text style={globalStyles.buttonText}>Verificar</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}