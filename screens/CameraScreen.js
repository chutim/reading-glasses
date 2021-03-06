import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { BarIndicator } from "react-native-indicators";
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
    googleResponse: null,
    ingredients: [],
    ingredientsCodes: [],
    ingredientsData: [],
    paranoidButtonState: false
  };

  // once component mounts, asks for permission to use camera
  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  // to be passed into Toolbar
  setFlashMode = flashMode => this.setState({ flashMode });

  takePic = async () => {
    this.setState({ uploading: true });
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
    this.setState({
      googleResponse: null,
      ingredients: [],
      ingredientsCodes: [],
      ingredientsData: [],
      paranoidButtonState: false
    });
  };

  maybeUploading = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(113, 231, 221, 1)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <BarIndicator count={9} size={70} color="rgb(255,175,2)" />
        </View>
      );
    }
  };

  submitToGoogle = async () => {
    try {
      // for rendering an animated loading overlay
      // this.setState({ uploading: true });
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
      console.log("Set Google Vision JSON response on state!");
      // this.arrayifyingredients(
      //   this.state.googleResponse.responses[0].fullTextAnnotation.pages
      // );
      this.arrayifyText(
        this.state.googleResponse.responses[0].fullTextAnnotation.text
      );
      console.log(
        "Converted Google Vision response into array of ingredients!"
      );
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

    this.setState({ ingredients: finalArr });
  };

  // formWord = word => {
  //   let formedWord = "";
  //   for (let symbol of word.symbols) {
  //     formedWord += symbol.text;
  //   }
  //   return formedWord;
  // };

  // arrayifyingredients = response => {
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
  // this.setState({ ingredients: arr });
  // console.log(this.state.ingredients);
  // };

  submitForCodes = async () => {
    try {
      // for rendering an animated loading overlay
      this.setState({ uploading: true, paranoidButtonState: true });
      console.log("Submitting to E-Additives for codes...");

      for (let i = 0; i < this.state.ingredients.length; i++) {
        let currentIngredient = this.state.ingredients[i];
        let response = await fetch(
          `https://vx-e-additives.p.rapidapi.com/additives/search?sort=name&q=${currentIngredient}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "vx-e-additives.p.rapidapi.com",
              "x-rapidapi-key":
                "d0458d5b93mshf9bad67704cc261p151375jsn3f91559c9939"
            }
          }
        );
        let responseJson = await response.json();
        if (responseJson.length) {
          this.setState({
            ingredientsCodes: [
              ...this.state.ingredientsCodes,
              responseJson[0].code
            ]
          });
        }
      }

      this.setState({
        uploading: false
      });
      console.log("Set E-Additive codes on state!");
      this.submitForData();
    } catch (error) {
      this.setState({
        uploading: false
      });
      console.log(error);
    }
  };

  submitForData = async () => {
    try {
      // for rendering an animated loading overlay
      this.setState({ uploading: true });
      console.log("Submitting to E-Additives for additive data...");

      for (let i = 0; i < this.state.ingredientsCodes.length; i++) {
        let currentCode = this.state.ingredientsCodes[i];
        let response = await fetch(
          `https://vx-e-additives.p.rapidapi.com/additives/${currentCode}?locale=en`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "vx-e-additives.p.rapidapi.com",
              "x-rapidapi-key":
                "d0458d5b93mshf9bad67704cc261p151375jsn3f91559c9939"
            }
          }
        );
        let responseJson = await response.json();
        this.setState({
          ingredientsData: [...this.state.ingredientsData, responseJson]
        });
      }
      this.setState({
        uploading: false
      });
      console.log("Set E-Additive data on state!");
    } catch (error) {
      this.setState({
        uploading: false
      });
      console.log(error);
    }
  };

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
                {this.state.ingredientsData.length === 0
                  ? this.state.ingredients.map((ingredient, idx) => (
                      <Text key={idx} style={styles.list}>
                        {ingredient}
                      </Text>
                    ))
                  : this.state.ingredientsData.map((additive, idx) => (
                      <View key={idx} style={styles.dataContainer}>
                        <Text style={styles.dataTitle}>
                          {additive.name.toUpperCase()}:{" "}
                          {additive.function || "Undesignated Purpose"}
                        </Text>
                        <Text style={[styles.dataWarning, styles.dataSection]}>
                          <Text
                            style={{ fontWeight: "bold", color: "#ff6e4e" }}
                          >
                            Warning:{" "}
                          </Text>
                          {additive.notice || "N/A"}
                        </Text>
                        <Text
                          style={[styles.dataInternational, styles.dataSection]}
                        >
                          <Text style={[styles.dataBold, { color: "#ffaf02" }]}>
                            International Status:{" "}
                          </Text>
                          {additive.status || "N/A"}
                        </Text>
                        <Text style={[styles.dataBody, styles.dataSection]}>
                          <Text style={styles.dataBold}>Uses: </Text>
                          {additive.foods || "N/A"}
                        </Text>
                        <Text style={[styles.dataBody, styles.dataSection]}>
                          <Text style={styles.dataBold}>Description: </Text>
                          {additive.info || "N/A"}
                        </Text>
                      </View>
                    ))}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={this.state.paranoidButtonState}
                  onPress={this.submitForCodes}
                >
                  <View
                    style={{
                      opacity: this.state.paranoidButtonState ? 0.6 : 1,
                      backgroundColor: "#ffaf02"
                    }}
                  >
                    <Text style={styles.button}>LET'S GET PARANOID</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.openCamera}>
                  <Text style={[styles.button, { backgroundColor: "#1fb9ac" }]}>
                    ANALYZE ANOTHER LABEL
                  </Text>
                </TouchableOpacity>
              </View>
              {this.maybeUploading()}
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
  button: {
    textAlign: "center",
    textAlignVertical: "center",
    height: 50,
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
  container: {
    flex: 1,
    backgroundColor: "#9cffde",
    paddingBottom: 100
  },
  list: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    padding: 15,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 30,
    backgroundColor: "white"
  },
  buttonContainer: {
    width: windowWidth,
    position: "absolute",
    bottom: 0
  },
  dataContainer: {
    padding: 17,
    margin: 15,
    borderRadius: 25,
    backgroundColor: "white"
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    padding: 13,
    marginBottom: 10,
    backgroundColor: "#44e0d4",
    borderRadius: 17,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  dataSection: {
    paddingBottom: 6
  },
  dataBold: {
    fontWeight: "bold",
    color: "#1fb9ac"
  },
  dataWarning: {
    fontSize: 17,
    color: "#FF9881"
  },
  dataInternational: {
    fontSize: 17,
    color: "#ffc74f"
  },
  dataBody: {
    fontSize: 17,
    color: "#23cfc0"
  }
});
