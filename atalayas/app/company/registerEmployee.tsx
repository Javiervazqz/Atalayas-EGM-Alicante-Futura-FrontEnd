import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterEmployee() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Registrar empleado</Text>

      <View style={styles.form}>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
        />

        <TextInput
          placeholder="Contraseña"
          style={styles.input}
        />

        <TouchableOpacity style={styles.button}>
          <Text>Crear empleado</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    marginBottom: 20,
  },

  form: {
    width: 260,
  },

  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
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