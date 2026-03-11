import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";



export default function Register() {


  return (
    <View style={globalStyles.container}>

      <Text style={globalStyles.title}>Registra tu empresa</Text>

      <View style={globalStyles.card}>

        <TextInput placeholder="Nombre" style={globalStyles.input} />
        <TextInput placeholder="Email" style={globalStyles.input} />
        <TextInput placeholder="Contraseña" secureTextEntry style={globalStyles.input} />
        <TextInput
            placeholder="Nombre de la empresa"
            style={globalStyles.input}
          />

        <TouchableOpacity 
            style={globalStyles.button}
            onPress={() => router.push("/mainPage")}>
            <Text>Registrarse</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}