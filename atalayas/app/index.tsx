import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

export default function Welcome() {
  return (
    <View style={globalStyles.containerOrange}>

      <Text style={globalStyles.title}>BIENVENIDO</Text>

      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>DIGI</Text>
        </View>
      </View>


      <View style={globalStyles.card}>

        <Text style={globalStyles.text}>Si eres empleado</Text>

        <TouchableOpacity 
          style={globalStyles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={globalStyles.buttonText}>Inicia sesión</Text>
        </TouchableOpacity>


        <Text style={globalStyles.text}>Si quieres registrar tu empresa</Text>

        <TouchableOpacity 
          style={globalStyles.button}
          onPress={() => router.push("/register")}
        >
          <Text>Registra tu empresa</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "yellow",
    fontWeight: "bold",
  },
});