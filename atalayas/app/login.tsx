import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";



export default function Login() {
  return (
    <View style={globalStyles.containerOrange}>

      <Text style={globalStyles.title}>Iniciar sesión</Text>

      <View style={globalStyles.card}>

        <TextInput placeholder="Email" style={globalStyles.input} />
        <TextInput placeholder="Contraseña" secureTextEntry style={globalStyles.input} />

        
        <TouchableOpacity 
            style={globalStyles.button}
            onPress={() => router.push("/mainPage")}>
            <Text>Inicia sesión</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}