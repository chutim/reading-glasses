import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import Toolbar from "../components/CameraTools";
import { GOOGLE_CLOUD_VISION_API_KEY } from "../secrets";
import { withNavigationFocus } from "react-navigation";

class CameraScreen extends React.Component {
  camera = null;
  state = {
    captured: null,
    // setting flash to be turned off by default
    flashMode: Camera.Constants.FlashMode.off,
    // capturing: true,
    hasCameraPermission: null,
    googleResponse: null
  };

  setFlashMode = flashMode => this.setState({ flashMode });

  takePic = async () => {
    const photoData = await this.camera.takePictureAsync({ base64: true });
    this.setState({
      // capturing: false,
      captured: photoData
      //photoData includes {uri,width,height,exif,base64}
    });
    this.submitToGoogle();
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  render() {
    const { hasCameraPermission, flashMode } = this.state;

    if (hasCameraPermission === null) {
      return null;
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }

    const { isFocused } = this.props;

    return (
      <>
        {isFocused && (
          <React.Fragment>
            <View>
              <Camera
                type={Camera.Constants.Type.back}
                flashMode={flashMode}
                style={styles.preview}
                ref={camera => (this.camera = camera)}
              />
            </View>

            <Toolbar
              flashMode={flashMode}
              setFlashMode={this.setFlashMode}
              onCapture={this.takePic}
            />
          </React.Fragment>
        )}
      </>
    );
  }

  submitToGoogle = async () => {
    try {
      // this.setState({ uploading: true });
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: "TEXT_DETECTION" },
              { type: "DOCUMENT_TEXT_DETECTION" }
            ],
            image: {
              content: this.state.captured.base64
            }
          }
        ]
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          GOOGLE_CLOUD_VISION_API_KEY,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      let responseJson = await response.json();
      // console.log(responseJson);
      this.setState({
        googleResponse: responseJson
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default withNavigationFocus(CameraScreen);

const { width: winWidth, height: winHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  preview: {
    height: winHeight,
    width: winWidth,
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }
});
