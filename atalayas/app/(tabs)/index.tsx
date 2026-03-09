import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>BIENVENIDO, usuario</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.card, styles.green]}>
          <Text style={styles.cardText}>CURSOS DE LA EMPRESA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.pink]}>
          <Text style={styles.cardText}>INFORMACIÓN DE LA EMPRESA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.cardLarge, styles.purple]}>
          <Text style={styles.cardText}>INFORMACIÓN DEL POLÍGONO</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.card, styles.yellow]}>
          <Text>placeholder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.teal]}>
          <Text>placeholder</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 30,
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 15,
  },

  card: {
    width: 140,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  cardLarge: {
    width: 280,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },

  cardText: {
    textAlign: "center",
    fontWeight: "bold",
  },

  green: {
    backgroundColor: "#24ff4f",
  },

  pink: {
    backgroundColor: "#d56a8b",
  },

  purple: {
    backgroundColor: "#7b00ff",
  },

  yellow: {
    backgroundColor: "#b59d00",
  },

  teal: {
    backgroundColor: "#36c7a0",
  },

});