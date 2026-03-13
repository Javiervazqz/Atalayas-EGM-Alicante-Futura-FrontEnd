import { StyleSheet } from "react-native";


export const globalStyles = StyleSheet.create({

    containerOrange: {
        flex: 1,
        backgroundColor: "#d7b56d",
        alignItems: "center",
        padding: 20,
    },
    container: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
        padding: 20,
        height: "100%",
        width: "100%",
    },
    containerCenter: {
        backgroundColor: "#ffffff",
        alignItems: "center",
        padding: 20,
        width: "100%",
        height: "110%",
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 20,
    },
    H4: {
        fontSize: 18,
        marginTop: 5,
        marginBottom: 5,
    },
    text: {
        fontSize: 16,
        marginTop: 5,
        marginBottom: 5,
    },

    textCenter: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 14,
        textAlign: "center",
    },
    cardButtonText: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
    },

    card: {
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#e8e8e8",
        padding: 25,
        borderRadius: 20,
        alignItems: "center",
    },
    cardInfo: {
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#e8e8e8",
        padding: 25,
        borderRadius: 20,
        alignItems: "center",
        width: "90%",
        maxWidth: 400,
        height: "90%",
    },
    cardLarge: {
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#e8e8e8",
        padding: 25,
        borderRadius: 20,
        alignItems: "center",
        width: "90%",
        maxWidth: 650,
        height: "90%",
        maxHeight: 150,
    },
    button: {
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        
        borderColor: "#555",
        backgroundColor: "white",
    },
    cardButton: {
        width: 140,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    cardLargeButton: {
        width: 280,
        height: 140,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 15,
    },
    cardEmployee: {
        backgroundColor: "#e8e8e8",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        width: "90%",
        maxWidth: 350,
    },
    input: {
        backgroundColor: "white",
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#555",
        padding: 10,
        marginVertical: 5,
        width: "90%",
        maxWidth: 350,
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 15,
        marginBottom: 15,
    },
    column: {
        flexDirection: "column",
        justifyContent: "center",
        gap: 15,
        marginBottom: 15,
    },

    form: {
        width: 260,
    },
    idUser: {
        position: "absolute",
        right: 15,
        bottom: 15,
        backgroundColor: "#f2d58a",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
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