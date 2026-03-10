import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CompanyManage() {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>GESTIÓN DE EMPRESA</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/company/manageEmployee")}>
                <Text>Gestionar empleado</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}>
                <Text>Gestionar los cursos</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}>
                <Text>Gestionar la información</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 12,
        backgroundColor: "#e5e5e5",
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 22,
        marginBottom: 30,
    },

    button: {
        backgroundColor: "#b59d00",
        padding: 15,
        borderRadius: 10,
        width: 220,
        alignItems: "center",
        marginBottom: 15,
    },

});