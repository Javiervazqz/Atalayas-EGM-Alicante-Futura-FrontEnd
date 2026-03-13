import { router } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../constants/styles";

const employees = [
  { id: "1", name: "Paco Paquez", role: "Rol de trabajo" },
  { id: "2", name: "Jose Josez", role: "Rol de trabajo" },
  { id: "3", name: "Martin Martinez", role: "Rol de trabajo" },
  { id: "4", name: "Juan Juanez", role: "Rol de trabajo" },
];

export default function EmployeeList() {
  return (

    <View style={globalStyles.containerCenter}>

      <Text style={globalStyles.title}>Eliminar empleado</Text>

      <TextInput
        placeholder="Buscar empleado..."
        style={globalStyles.input}
      />

      {employees.map((employee) => (

        <TouchableOpacity
          key={employee.id}
          style={globalStyles.cardEmployee}
          onPress={() =>
            router.push({
              pathname: "/employeeInfo",
              params: { name: employee.name, role: employee.role },
            })
          }
        >
          <Text>{employee.name}</Text>
        </TouchableOpacity>

      ))}

    </View>
  );
}