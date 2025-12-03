import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import { PlayerScreen } from "./MusicPlayer";
import MyScreen from "./MineScreen";
import { StatusBar } from "expo-status-bar";
import SearchPage from "./SearchPage";
const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function TopTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
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
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {/* 顶部导航栏 + 内容 */}
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TopTabs} />
          <Stack.Screen name="SearchPage" component={SearchPage} />
        </Stack.Navigator>
      </View>
    </SafeAreaView>
  );
}
