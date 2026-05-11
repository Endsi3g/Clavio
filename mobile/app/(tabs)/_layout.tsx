import { Tabs } from 'expo-router'
import { Home, Lightbulb, User, Video, Send } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { StyleSheet } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#3b82f6', 
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 32,
          height: 64,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]} />
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={26} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Idées',
          tabBarIcon: ({ color }) => <Lightbulb size={26} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Vidéos',
          tabBarIcon: ({ color }) => <Video size={26} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          tabBarIcon: ({ color }) => <Send size={26} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color }) => <User size={26} color={color} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  )
}
