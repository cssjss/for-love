import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "./HomeScreen";
import MyScreen from "./MineScreen";
import { PlayerScreen } from "./MusicPlayer";
import SearchPage from "./SearchPage";
import HistoryScreen from "./historyPage";
import MyFavoriteScreen from "./lovepage";
import Musiclist, { RootStackParamList } from "./musiclist";
const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TopTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          paddingTop: insets.top,
          backgroundColor: "rgba(255, 255, 255, 0.5)", // 顶部透明
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { height: 35 },
        tabBarActiveTintColor: "dark",
        tabBarInactiveTintColor: "dark",
        tabBarIndicatorStyle: {
          backgroundColor: "#31c27c",
          height: 2,
          borderRadius: 3,
        },
        tabBarLabelStyle: {
          marginTop: -10,
          fontSize: 18,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen name="发现" component={HomeScreen} />
      <Tab.Screen name="播放" component={PlayerScreen} />
      <Tab.Screen name="我的" component={MyScreen} />
    </Tab.Navigator>
  );
}

export default function TopTabsBlur() {
  // 处理安卓底部导航栏全屏沉浸
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("transparent");
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* 配置 StatusBar 允许内容穿透 (translucent)，背景透明 */}
      <StatusBar
        style="dark"
        translucent={true}
        backgroundColor="transparent"
      />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TopTabs} />
        <Stack.Screen name="SearchPage" component={SearchPage} />
        <Stack.Screen name="Musiclist" component={Musiclist} />
        <Stack.Screen name="MyFavoriteScreen" component={MyFavoriteScreen} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      </Stack.Navigator>
    </View>
  );
}
