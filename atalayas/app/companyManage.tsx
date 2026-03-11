import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function CompanyManage() {
    return (
        <View style={globalStyles.containerCenter}>

            <Text style={globalStyles.title}>GESTIÓN DE EMPRESA</Text>
            <View style={globalStyles.card}>
                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push("/manageEmployee")}>
                    <Text style={globalStyles.buttonText}>Gestionar empleado</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Gestionar los cursos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>Gestionar la información</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}