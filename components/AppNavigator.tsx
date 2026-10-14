import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import LyricsScreen from "./LyricsScreen";
import MyFavoriteScreen from "./lovepage";
import Musiclist, { RootStackParamList } from "./musiclist";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomGap =
    Platform.OS === "ios" ? Math.max(insets.bottom, 10) : Math.max(insets.bottom, 14);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          elevation: 0,
          shadowOpacity: 0,
          height: 58 + bottomGap,
          paddingTop: 6,
          paddingBottom: bottomGap,
        },
        tabBarActiveTintColor: "#31c27c",
        tabBarInactiveTintColor: "#333",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "发现"
              ? "compass"
              : route.name === "播放"
                ? "musical-notes"
                : "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
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
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="SearchPage" component={SearchPage} />
        <Stack.Screen name="Musiclist" component={Musiclist} />
        <Stack.Screen name="MyFavoriteScreen" component={MyFavoriteScreen} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        <Stack.Screen name="LyricsScreen" component={LyricsScreen} />
      </Stack.Navigator>
    </View>
  );
}
