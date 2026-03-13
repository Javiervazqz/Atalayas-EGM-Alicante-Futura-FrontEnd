import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function CompanyManage() {
    return (
        <View style={globalStyles.containerCenter}>

            <Text style={globalStyles.title}>GESTIONAR EMPLEADOS</Text>
            <View style={globalStyles.card}>
                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/registerEmployee")}>
                    <Text style={globalStyles.buttonText}>Registrar empleados</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/employeeList")}>
                    <Text style={globalStyles.buttonText}>Mostrar lista de empleados</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/employeeEdit")}>
                    <Text style={globalStyles.buttonText}>Editar imformación de empleado</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/employeeDelete")}>
                    <Text style={globalStyles.buttonText}>Eliminar empleado</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}