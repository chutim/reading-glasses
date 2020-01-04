import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ImageBackground,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default class HomeScreen extends React.Component {
  state = {
    websiteUrl: ""
  };

  openBrowser = async () => {
    await WebBrowser.openBrowserAsync(this.state.websiteUrl);
  };

  openLinkedIn = async () => {
    await this.setState({ websiteUrl: "https://www.linkedin.com/in/chutim/" });
    this.openBrowser();
  };

  openGitHub = async () => {
    await this.setState({
      websiteUrl: "https://github.com/timchu92/reading-glasses"
    });
    this.openBrowser();
  };

  render() {
    return (
      <ImageBackground
        source={require("../assets/images/reading-glasses-home.png")}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={this.openLinkedIn}
            style={styles.footerButtons}
          >
            <Text style={styles.buttonText}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.openGitHub}
            style={styles.footerButtons}
          >
            <Text style={styles.buttonText}>GitHub</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    width: windowWidth,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  footerButtons: {
    flex: 1,
    backgroundColor: "#2edccf",
    borderRadius: 30,
    padding: 7,
    margin: 20,
    marginLeft: 40,
    marginRight: 40
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    textAlignVertical: "center"
  }
});
