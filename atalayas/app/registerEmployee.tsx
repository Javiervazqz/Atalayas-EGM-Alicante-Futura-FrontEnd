import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function RegisterEmployee() {
  return (
    <View style={globalStyles.containerCenter}>

      <Text style={globalStyles.title}>Registrar empleado</Text>

      <View style={globalStyles.form}>
        <View style={globalStyles.card}>
          <TextInput
            placeholder="Nombre"
            style={globalStyles.input}
          />

          <TextInput
            placeholder="Email"
            style={globalStyles.input}
          />

          <TextInput
            placeholder="Contraseña"
            style={globalStyles.input}
          />

          <TouchableOpacity style={globalStyles.button}>
            <Text style={globalStyles.buttonText}>Crear empleado</Text>
          </TouchableOpacity>
        </View>


      </View>

    </View>
  );
}