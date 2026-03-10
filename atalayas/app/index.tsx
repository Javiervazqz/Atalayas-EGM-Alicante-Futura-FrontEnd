import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>BIENVENIDO</Text>

      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>DIGI</Text>
        </View>
      </View>


      <View style={styles.card}>

        <Text style={styles.text}>Si eres empleado</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text>Inicia sesión</Text>
        </TouchableOpacity>


        <Text style={styles.text}>Si quieres registrar tu empresa</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/register")}
        >
          <Text>Registra tu empresa</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#d7b56d",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    color: "white",
    marginBottom: 20,
  },

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

  card: {
    backgroundColor: "#e8e8e8",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: 250,
  },

  text: {
    marginTop: 10,
  },

  button: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "white",
  },

});