import { Tabs } from "expo-router";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SharedValue,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

import { useAuthStore } from '../../store/authStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  label: string;
  icon: IconName;
  focusedIcon: IconName;
}

const TAB_CONFIGS: TabConfig[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', focusedIcon: 'home' },
  { name: 'create-post', label: 'Post', icon: 'add-circle-outline', focusedIcon: 'add-circle' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', focusedIcon: 'person' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_MARGIN = 50;
const TAB_BAR_WIDTH = SCREEN_WIDTH - (TAB_BAR_MARGIN * 2);
const PILL_WIDTH = 48;
const PILL_HEIGHT = 48;

function TabIcon({ focused, icon, focusedIcon, scale }: { focused: boolean, icon: IconName, focusedIcon: IconName, scale: SharedValue<number> }) {
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={iconAnimatedStyle}>
      <Ionicons
        name={focused ? focusedIcon : icon}
        size={22}
        color={focused ? "#ffffff" : "#94a3b8"}
      />
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const config = TAB_CONFIGS;

  useEffect(() => {
    if (layout.width === 0) return;

    const tabWidth = layout.width / config.length;
    const activeRouteName = state.routes[state.index].name;
    const activeIndex = config.findIndex(c => c.name === activeRouteName);

    // Default to first tab if not found (shouldn't happen)
    const targetIndex = activeIndex !== -1 ? activeIndex : 0;

    const targetX = (targetIndex * tabWidth) + (tabWidth - PILL_WIDTH) / 2;

    translateX.value = withSpring(targetX, {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    });
  }, [state.index, layout.width, state.routes]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.tabBarContainer,
        { bottom: Math.max(insets.bottom, 16) }
      ]}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
    >
      {/* Background Layer with Shadow */}
      <View style={styles.tabBarBackground} />

      {/* Indicator Layer */}
      {layout.width > 0 && (
        <Animated.View style={[
          styles.slidingPill,
          indicatorStyle,
          { top: (layout.height - PILL_HEIGHT) / 2 } // Center vertically
        ]} />
      )}

      {/* Interaction Layer (Buttons and Icons) */}
      <View style={styles.buttonsContainer}>
        {config.map((tabConfig, index) => {
          const route = state.routes.find((r: any) => r.name === tabConfig.name);
          const isFocused = state.routes[state.index].name === tabConfig.name;

          if (!route) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const scale = useSharedValue(1);
          useEffect(() => {
            scale.value = withSpring(isFocused ? 1.15 : 1, {
              damping: 12,
              stiffness: 200,
            });
          }, [isFocused]);

          return (
            <TouchableOpacity
              key={tabConfig.name}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <TabIcon
                focused={isFocused}
                icon={tabConfig.icon}
                focusedIcon={tabConfig.focusedIcon}
                scale={scale}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="create-post" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    elevation: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  slidingPill: {
    position: 'absolute',
    left: 0,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    zIndex: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

