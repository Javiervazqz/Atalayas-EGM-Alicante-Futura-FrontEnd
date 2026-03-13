import { ScrollView, StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function CompanyInfo() {
  return (

    <ScrollView style={globalStyles.container}>

      <Text style={globalStyles.title}>Información de la empresa</Text>

      <View style={globalStyles.contentContainer}>

        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>CONTENIDO</Text>
          <Text>• Apartado 1</Text>
          <Text>• Apartado 2</Text>
          <Text>• Apartado 3</Text>
          <Text>• Apartado 4</Text>
          <Text>• Apartado 5</Text>
        </View>

        <View style={styles.mainContent}>

          <Text style={styles.sectionTitle}>Apartado 1</Text>
          <Text style={globalStyles.text}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </Text>

          <Text style={styles.sectionTitle}>Apartado 2</Text>
          <Text style={globalStyles.text}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </Text>

        </View>

      </View>

    </ScrollView>
  );


}
const styles = StyleSheet.create({
  sidebar: {
        width: 120,
        backgroundColor: "#ddd",
        padding: 10,
        borderRadius: 8,
        marginRight: 15,
        alignItems: "center",
    },

    sidebarTitle: {
        fontWeight: "bold",
        marginBottom: 10,
    },

    mainContent: {
        flex: 1,
        maxWidth: 500,
    },

    sectionTitle: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5,
    },
});
