import React from "react";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Col, Row, Grid } from "react-native-easy-grid";
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from "react-native";

// const { FlashMode: CameraFlashModes } = Camera.Constants;

export default ({
  flashMode = Camera.Constants.FlashMode.off,
  setFlashMode,
  onCapture
}) => (
  <Grid style={styles.bottomToolbar}>
    <Row>
      <Col style={styles.alignCenter}>
        <TouchableOpacity
          onPress={() =>
            setFlashMode(
              flashMode === Camera.Constants.FlashMode.on
                ? Camera.Constants.FlashMode.off
                : Camera.Constants.FlashMode.on
            )
          }
        >
          <Ionicons
            name={
              flashMode == Camera.Constants.FlashMode.on
                ? "md-flash"
                : "md-flash-off"
            }
            color="white"
            size={30}
          />
        </TouchableOpacity>
      </Col>
      <Col size={2} style={styles.alignCenter}>
        <TouchableWithoutFeedback
          // onPressIn={onCaptureIn}
          // onPressOut={onCaptureOut}
          // onLongPress={onLongCapture}
          onPress={onCapture}
        >
          <View style={styles.captureBtn}></View>
        </TouchableWithoutFeedback>
      </Col>
      <Col></Col>
    </Row>
  </Grid>
);

const { width: winWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  alignCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  bottomToolbar: {
    width: winWidth,
    position: "absolute",
    height: 100,
    bottom: 0
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 60,
    borderColor: "#FFFFFF"
  }
});
