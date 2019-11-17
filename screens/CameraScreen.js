import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  FlatList
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import Toolbar from "../components/CameraTools";
import { GOOGLE_CLOUD_VISION_API_KEY } from "../secrets";
import { withNavigationFocus } from "react-navigation";

class CameraScreen extends React.Component {
  // initiated to be set to Camera component, so that its takePicture method is accessible
  camera = null;
  state = {
    // where the image will be stored
    captured: null,
    // flash is off by default
    flashMode: Camera.Constants.FlashMode.off,
    // app needs to ask for permission to access native camera
    hasCameraPermission: null,
    // Google Vision's response will be set here and then rendered on screen. if null, logic will just display camera
    googleResponse: null
  };

  // to be passed into Toolbar
  setFlashMode = flashMode => this.setState({ flashMode });

  takePic = async () => {
    // requests that the image also be converted into base64, needed for sending to Google Vision
    const photoData = await this.camera.takePictureAsync({ base64: true });
    console.log("Picture taken!");
    this.setState({
      captured: photoData
      // photoData includes {uri,width,height,base64}
    });
    this.submitToGoogle();
  };

  // once component mounts, asks for permission to use camera
  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  render() {
    const { hasCameraPermission, flashMode } = this.state;

    // if permission hasn't been asked for, render nothing. if denied, render text.
    if (hasCameraPermission === null) {
      return null;
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }

    // isFocused allows the camera to appear again after tabbing away and back. withNavigationFocus wraps this whole component in order for this to work
    const { isFocused } = this.props;

    // if there is no data yet, display the camera and its tools. if there is data, render it and provide a button to open the camera again, erasing this.state.googleResponse
    return (
      <>
        {isFocused && this.state.googleResponse === null ? (
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
        ) : (
          // without checking googleResponse, error will be thrown once you tab away
          this.state.googleResponse && (
            <>
              <FlatList
                data={this.state.googleResponse.responses[0].text}
                extraData={this.state}
                keyExtractor={this._keyExtractor}
                renderItem={({ item }) => <Text>Item: {item.description}</Text>}
              />
              <Text>
                {this.state.googleResponse.responses[0].fullTextAnnotation.text}
              </Text>
              <Button onPress={this.openCamera} title="Take Another Picture!" />
            </>
          )
        )}
      </>
    );
  }

  _keyExtractor = (item, index) => item.id;

  // clear this.state.googleResponse to trigger re-render of camera component
  openCamera = () => {
    this.setState({ googleResponse: null });
  };

  submitToGoogle = async () => {
    try {
      // this.setState({ uploading: true }); maybe use this for a loading screen
      console.log("Submitting to Google Vision...");
      // construct the body to send & request what kind of analyses you want
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
      this.setState({
        googleResponse: responseJson
      });
      // this.setState({uploading:false}); maybe use to unmount the loading screen
      console.log("Set JSON response on state!");
    } catch (error) {
      console.log(error);
    }
  };
}
// wrapping the component like this allows it to re-render when you tab back
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
