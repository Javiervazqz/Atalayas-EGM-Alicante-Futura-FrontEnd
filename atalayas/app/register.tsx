import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function Registro() {

  const [rol, setRol] = useState("");

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Registra tu empresa</Text>

      <View style={styles.card}>

        <TextInput placeholder="Nombre" style={styles.input} />
        <TextInput placeholder="Email" style={styles.input} />
        <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} />
        <TextInput
            placeholder="Nombre de la empresa"
            style={styles.input}
          />

        <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/mainPage")}>
            <Text>Registrarse</Text>
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

  card: {
    backgroundColor: "#e8e8e8",
    padding: 25,
    borderRadius: 20,
    width: 280,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  roleButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
    width: "48%",
    alignItems: "center",
  },

  button: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  }

});