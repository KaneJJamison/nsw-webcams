import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CameraScreen from '../screens/CameraScreen';
import AppLogo from '../components/AppLogo';
import { useFavourites } from '../context/FavouritesContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Shared camera screen options
const cameraScreenOptions = ({ route }) => ({
  title: route.params?.camera?.name ?? 'Camera',
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#1a1a1a',
  headerTitleStyle: { fontWeight: '600' },
  headerShadowVisible: false,
  headerRight: () => <AppLogo size="small" />,
});

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} options={cameraScreenOptions} />
    </Stack.Navigator>
  );
}

function FavouritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavouritesMain" component={FavouritesScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} options={cameraScreenOptions} />
    </Stack.Navigator>
  );
}

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} options={cameraScreenOptions} />
    </Stack.Navigator>
  );
}

// Custom tab bar icon using text/emoji
function TabIcon({ emoji, label, focused, color, badge }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.emoji, { opacity: focused ? 1 : 0.55 }]}>{emoji}</Text>
      {badge > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabNavigator() {
  const { favourites } = useFavourites();
  const favCount = favourites.size;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B5CAB',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={FavouritesStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⭐" label="Favourites" focused={focused} color={color} badge={favCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🗺️" label="Explore" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  emoji: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#e67e00',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
