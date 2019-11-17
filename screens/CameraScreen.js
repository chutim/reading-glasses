import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator
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
    uploading: false,
    // Google Vision's response will be set here and then rendered on screen. if null, logic will just display camera
    googleResponse: 1,
    phrases: []
  };

  // once component mounts, asks for permission to use camera
  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

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

  // clear this.state.googleResponse to trigger re-render of camera component
  openCamera = () => {
    this.setState({ googleResponse: null });
  };

  maybeUploading = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <ActivityIndicator size="large" color="1fb9ac" />
        </View>
      );
    }
  };

  submitToGoogle = async () => {
    try {
      // for rendering an animated loading overlay
      this.setState({ uploading: true });
      console.log("Submitting to Google Vision...");
      // construct the body to send & request what kind of analyses you want
      let body = JSON.stringify({
        requests: [
          {
            features: [
              // { type: "TEXT_DETECTION" },
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
        uploading: false,
        googleResponse: responseJson
      });
      console.log("Set JSON response on state!");
      // this.arrayifyPhrases(
      //   this.state.googleResponse.responses[0].fullTextAnnotation.pages
      // );
      this.arrayifyText(
        this.state.googleResponse.responses[0].fullTextAnnotation.text
      );
      console.log("Converted response into array of phrases!");
    } catch (error) {
      this.setState({
        uploading: false
      });
      console.log(error);
    }
  };

  removeParens = string => {
    let result = "";
    for (let i = 0; i < string.length; i++) {
      if (string[i] === "(") {
        result = result.slice(0, -1);
        result += ", ";
      } else if (string[i] === ")") continue;
      else result += string[i];
    }
    return result;
  };

  capitalize = string => {
    let result = string[0].toUpperCase();
    for (let i = 1; i < string.length; i++) {
      if (string[i] === " ") {
        result += ` ${string[i + 1].toUpperCase()}`;
        i++;
      } else result += string[i];
    }
    return result;
  };

  arrayifyText = string => {
    const tempArr = string.split("\n");
    const totalStr = tempArr.join(" ").toLowerCase();

    const trimmedFront = totalStr.split("ingredients: ")[1];
    const trimmed = trimmedFront.split(".")[0];

    const lowerCaseStr = this.removeParens(trimmed);
    const finalStr = this.capitalize(lowerCaseStr);
    const finalArr = finalStr.split(", ");
    console.log("finalArr", finalArr);

    this.setState({ phrases: finalArr });
  };

  // formWord = word => {
  //   let formedWord = "";
  //   for (let symbol of word.symbols) {
  //     formedWord += symbol.text;
  //   }
  //   return formedWord;
  // };

  // arrayifyPhrases = response => {
  //   let arr = [];
  //   for (let page of response) {
  //     for (let block of page.blocks) {
  //       for (let paragraph of block.paragraphs) {
  //         let line = "";
  //         for (let word of paragraph.words) {
  //           let formedWord = this.formWord(word);
  //           line += `${formedWord} `;
  //         }
  //         arr.push(line.slice(0, -1));
  //       }
  //     }
  //   }
  // this.setState({ phrases: arr });
  // console.log(this.state.phrases);
  // };

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
            {this.maybeUploading()}
          </React.Fragment>
        ) : (
          // without checking googleResponse, error will be thrown once you tab away
          this.state.googleResponse && (
            <View style={styles.container}>
              <ScrollView>
                {this.state.phrases.map((phrase, idx) => (
                  <Text key={idx} style={styles.list}>
                    {phrase}
                  </Text>
                ))}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <Button
                  style={styles.button}
                  onPress={this.openCamera}
                  title="Take Another Picture!"
                  color="#1fb9ac"
                />
              </View>
            </View>
          )
        )}
      </>
    );
  }
}
// wrapping the component like this allows it to re-render when you tab back
export default withNavigationFocus(CameraScreen);

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  preview: {
    height: windowHeight,
    width: windowWidth,
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  },
  container: {
    flex: 1
  },
  list: {
    fontSize: 30,
    textAlign: "center"
  },
  buttonContainer: {
    width: windowWidth,
    position: "absolute",
    bottom: 0
  }
});
