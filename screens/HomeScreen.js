import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../assets/images/reading-glasses.png")}
      style={{ width: "100%", height: "100%" }}
    ></ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
