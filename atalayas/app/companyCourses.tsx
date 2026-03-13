import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";


export default function CompanyCourses() {

  const [openCourse, setOpenCourse] = useState<number | null>(null);

  const courses = [
    "Curso 1: Políticas de la empresa",
    "Curso 2: placeholder",
    "Curso 3: placeholder",
    "Curso 4: placeholder",
    "Curso 5: placeholder",
  ];

  return (
    <View style={globalStyles.containerCenter}>

      <Text style={globalStyles.title}>Cursos de la empresa</Text>

      {courses.map((course, index) => (

        <View key={index} style={styles.courseCard}>

          <TouchableOpacity
            style={styles.courseHeader}
            onPress={() =>
              setOpenCourse(openCourse === index ? null : index)
            }
          >
            <Text>{course}</Text>
            <Text>{openCourse === index ? "⌄" : "›"}</Text>
          </TouchableOpacity>

          {openCourse === index && (
            <View style={styles.courseContent}>

              <TouchableOpacity style={styles.actionButton}>
                <Text>Ver en la aplicación ▶</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text>Descargar ⬇</Text>
              </TouchableOpacity>

            </View>
          )}

        </View>

      ))}

    </View>
  );
}

const styles = StyleSheet.create({

  courseCard: {
    width: 500,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },

  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  courseContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  actionButton: {
    backgroundColor: "#e8b8b8",
    padding: 10,
    borderRadius: 8,
  },

});