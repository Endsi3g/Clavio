import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { supabase, WORKSPACE_ID } from '../../lib/supabase'
import { CalendarDays, Send, CheckCircle2, Clock } from 'lucide-react-native'

type Post = {
  id: string
  caption: string
  status: string
  platform: string
  scheduled_for: string
  created_at: string
}

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data)
        setLoading(false)
      })
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pb-24">
      <View className="p-4 border-b border-slate-200 bg-white flex-row items-center justify-between">
        <Text className="text-xl font-bold text-slate-900 tracking-tight">Publications</Text>
        <Send size={24} color="#3b82f6" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="bg-blue-100 px-2 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-blue-700 uppercase">{item.platform}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {item.status === 'published' ? (
                      <CheckCircle2 size={12} color="#10b981" />
                    ) : (
                      <Clock size={12} color="#f59e0b" />
                    )}
                    <Text className="text-xs text-slate-500 capitalize">{item.status}</Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <Text className="text-sm text-slate-900 font-medium" numberOfLines={3}>
                {item.caption || 'Sans description...'}
              </Text>
              
              {item.scheduled_for && (
                <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <CalendarDays size={14} color="#64748b" />
                  <Text className="text-xs text-slate-500 font-medium">
                    Prévu pour: {new Date(item.scheduled_for).toLocaleString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Send size={48} color="#cbd5e1" />
              <Text className="text-center text-slate-500 mt-4">Aucune publication trouvée.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
