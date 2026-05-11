import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { User, LogOut } from 'lucide-react-native'

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-4 border-b border-slate-200 bg-white">
        <Text className="text-xl font-bold text-slate-900">Paramètres</Text>
      </View>
      
      <View className="p-4">
        <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-100">
            <User size={20} color="#64748b" />
            <Text className="ml-3 text-base text-slate-700">Profil Utilisateur</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <LogOut size={20} color="#ef4444" />
            <Text className="ml-3 text-base text-red-500">Déconnexion</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-center text-xs text-slate-400 mt-6">Clavio Mobile v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}
