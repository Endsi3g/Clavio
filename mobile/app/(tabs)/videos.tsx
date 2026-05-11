import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { supabase, WORKSPACE_ID } from '../../lib/supabase'
import { PlayCircle, Video as VideoIcon, CheckCircle2, Clock } from 'lucide-react-native'

type Video = {
  id: string
  title: string
  status: string
  thumbnail_url: string
  duration_seconds: number
  created_at: string
}

export default function VideosScreen() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('videos')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setVideos(data)
        setLoading(false)
      })
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pb-24">
      <View className="p-4 border-b border-slate-200 bg-white flex-row items-center justify-between">
        <Text className="text-xl font-bold text-slate-900 tracking-tight">Vidéos brutes</Text>
        <VideoIcon size={24} color="#3b82f6" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-row">
              <View className="w-28 h-28 bg-slate-100 items-center justify-center relative">
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} className="w-full h-full object-cover" />
                ) : (
                  <VideoIcon size={32} color="#cbd5e1" />
                )}
                <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-white">
                  <Text className="text-[10px] text-white font-medium">
                    {item.duration_seconds ? `${Math.floor(item.duration_seconds / 60)}:${(item.duration_seconds % 60).toString().padStart(2, '0')}` : '0:00'}
                  </Text>
                </View>
              </View>
              <View className="flex-1 p-3 justify-between">
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-1" numberOfLines={2}>
                    {item.title || 'Vidéo sans titre'}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 mt-2">
                  {item.status === 'ready' ? (
                    <CheckCircle2 size={12} color="#10b981" />
                  ) : item.status === 'processing' ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Clock size={12} color="#64748b" />
                  )}
                  <Text className="text-xs text-slate-500 capitalize">{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <PlayCircle size={48} color="#cbd5e1" />
              <Text className="text-center text-slate-500 mt-4">Aucune vidéo uploadée.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
