import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import App from "../screens/SettingsScreen";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: "Home",
  tabBarOptions: {
    activeTintColor: "#1fbaad",
    inactiveTintColor: "#9defe8",
    showLabel: false
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-home" : "md-home"}
    />
  )
};

HomeStack.path = "";

const CameraStack = createStackNavigator(
  {
    Links: CameraScreen
  },
  config
);

CameraStack.navigationOptions = {
  tabBarLabel: "Camera",
  tabBarOptions: {
    activeTintColor: "#1fbaad",
    inactiveTintColor: "#9defe8",
    showLabel: false
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-camera" : "md-camera"}
    />
  )
};

CameraStack.path = "";

const SettingsStack = createStackNavigator(
  {
    Settings: App
  },
  config
);

SettingsStack.navigationOptions = {
  tabBarLabel: "Settings",
  tabBarOptions: {
    activeTintColor: "#1fbaad",
    inactiveTintColor: "#9defe8"
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-options" : "md-options"}
    />
  )
};

SettingsStack.path = "";

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  CameraStack
  // SettingsStack
});

tabNavigator.path = "";

export default tabNavigator;
