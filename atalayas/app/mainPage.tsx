import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function Home() {
  return (
    <View style={globalStyles.containerCenter}>

      <Text style={globalStyles.title}>BIENVENIDO, usuario</Text>

      <View style={globalStyles.row}>
        <TouchableOpacity style={[globalStyles.cardButton, globalStyles.green]}
        onPress={() => router.push("/companyCourses")}>
          <Text style={globalStyles.cardButtonText}>CURSOS DE LA EMPRESA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[globalStyles.cardButton, globalStyles.pink]}
        onPress={() => router.push("/companyInfo")}>
          <Text style={globalStyles.cardButtonText}>INFORMACIÓN DE LA EMPRESA</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.row}>
        <TouchableOpacity style={[globalStyles.cardLargeButton, globalStyles.purple]}>
          <Text style={globalStyles.cardButtonText}>INFORMACIÓN DEL POLÍGONO</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.row}>
        <TouchableOpacity 
        style={[globalStyles.cardButton, globalStyles.yellow]}
        onPress={() => router.push("/companyManage")}>
          <Text style={globalStyles.cardButtonText}>GESTIONA TU EMPRESA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[globalStyles.cardButton, globalStyles.teal]}>
          <Text>placeholder</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}