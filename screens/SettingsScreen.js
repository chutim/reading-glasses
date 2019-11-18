import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import * as Permissions from "expo-permissions";

export default class App extends React.Component {
  state = {
    hasCameraPermission: ""
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  SelectImage() {
    ImagePicker.openCropper({
      path: "../assets/images/reading-glasses.png",
      width: 300,
      height: 400
    }).then(image => {
      console.log(image);
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text
          style={{ padding: 20, backgroundColor: "#ddd" }}
          onPress={() => this.SelectImage()}
        >
          Select Image
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Image: {
    height: 250,
    width: 250
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  }
});
