import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ iconFilled, iconOutline, focused }: { iconFilled: IconName; iconOutline?: IconName; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <MaterialCommunityIcons
        name={focused ? iconFilled : (iconOutline || iconFilled)}
        size={24}
        color={focused ? Colors.light.primary : Colors.light['on-surface-variant']}
      />
    </View>
  );
}

export default function TabLayout() {
  const theme = 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[theme].primary,
        tabBarInactiveTintColor: Colors[theme]['on-surface-variant'],
        tabBarStyle: {
          backgroundColor: Colors[theme].surface,
          borderTopColor: Colors[theme]['surface-container'],
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 24,
          height: 72,
        },
        tabBarLabelStyle: {
          ...Typography['label-sm'],
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon iconFilled="home" iconOutline="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon iconFilled="magnify" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon iconFilled="receipt" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon iconFilled="account" iconOutline="account-outline" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {},
});
