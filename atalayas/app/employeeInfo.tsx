import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

export default function EmployeeInfo() {

    const { name, role } = useLocalSearchParams();

    return (

        <ScrollView contentContainerStyle={globalStyles.containerCenter}>

            <Text style={globalStyles.title}>Información del empleado</Text>

            <View
                style={globalStyles.cardLarge}>
                <Text style={globalStyles.text}>{name}</Text>
                <Text style={globalStyles.text}>{role}</Text>
                <View
                    style={globalStyles.idUser}>
                    <Text style={globalStyles.text}>ID: #1234</Text>
                </View>
            </View>

            <View style={globalStyles.column}>
            <View style={globalStyles.row}>
                <View style={globalStyles.cardInfo}>
                    <Text style={globalStyles.H4}>CORREO ELECTRÓNICO</Text>
                    <Text style={globalStyles.text}>paco@example.com</Text>
                </View>

                <View style={globalStyles.cardInfo}>
                    <Text style={globalStyles.H4}>TELÉFONO</Text>
                    <Text style={globalStyles.text}>+34 666 66 66 66</Text>
                </View>
            </View>
            <View style={globalStyles.row}>
                <View style={globalStyles.cardInfo}>
                    <Text style={globalStyles.H4}>FECHA DE INGRESO</Text>
                    <Text style={globalStyles.text}>01 Enero 2000</Text>
                </View>
                <View style={globalStyles.cardInfo}>
                    <Text style={globalStyles.H4}>DEPARTAMENTO</Text>
                    <Text style={globalStyles.text}>Ventas</Text>
                </View>
            </View>
            </View>
        <View style={{ marginTop: 30, alignItems: "center" }}>
        <Text style={{ marginBottom: 10 }}>DOCUMENTOS ADJUNTOS</Text>

        <TouchableOpacity
          style={[
            globalStyles.button,
            { width: 200, marginBottom: 10 }
          ]}
        >
          <Text>Contrato_Laboral.png</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            globalStyles.button,
            { width: 200 }
          ]}
        >
          <Text>DNI_Copia.jpg</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
    );
}