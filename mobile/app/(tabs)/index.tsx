import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { supabase, WORKSPACE_ID } from '../../lib/supabase'
import { BarChart3, Users, Play, Heart } from 'lucide-react-native'

export default function Dashboard() {
  const [stats, setStats] = useState({ ideas: 0, posts: 0 })
  const [analytics, setAnalytics] = useState({ views: 0, likes: 0, watchTime: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // Load standard stats
      const [ideasRes, postsRes] = await Promise.all([
        supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('workspace_id', WORKSPACE_ID),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('workspace_id', WORKSPACE_ID).in('status', ['published', 'scheduled'])
      ])
      
      setStats({
        ideas: ideasRes.count || 0,
        posts: postsRes.count || 0
      })

      // Load analytics from post_metrics
      const { data: metricsData } = await supabase
        .from('post_metrics')
        .select('views, likes, watch_time_seconds')
        .eq('workspace_id', WORKSPACE_ID)
      
      let totalViews = 0
      let totalLikes = 0
      let totalWatchTime = 0

      if (metricsData) {
        metricsData.forEach(m => {
          totalViews += m.views || 0
          totalLikes += m.likes || 0
          totalWatchTime += m.watch_time_seconds || 0
        })
      }

      setAnalytics({ views: totalViews, likes: totalLikes, watchTime: totalWatchTime })
      setLoading(false)
    }
    
    loadData()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pb-20">
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</Text>
          <View className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users size={20} color="#3b82f6" />
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        ) : (
          <View className="gap-6">
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <Text className="text-sm font-medium text-slate-500 mb-2">Total Idées</Text>
                <Text className="text-4xl font-bold text-slate-900">{stats.ideas}</Text>
              </View>
              <View className="flex-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <Text className="text-sm font-medium text-slate-500 mb-2">Posts Actifs</Text>
                <Text className="text-4xl font-bold text-slate-900">{stats.posts}</Text>
              </View>
            </View>

            {/* Analytics Section */}
            <View className="mt-2">
              <Text className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Analytics Globales</Text>
              <View className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 gap-6">
                
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <Play size={24} color="#6366f1" fill="#6366f1" />
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-slate-500">Vues Totales</Text>
                      <Text className="text-2xl font-bold text-slate-900">{analytics.views.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                <View className="h-px bg-slate-100 w-full" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
                      <Heart size={24} color="#ec4899" fill="#ec4899" />
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-slate-500">Likes</Text>
                      <Text className="text-2xl font-bold text-slate-900">{analytics.likes.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                <View className="h-px bg-slate-100 w-full" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                      <BarChart3 size={24} color="#f59e0b" />
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-slate-500">Temps de visionnage</Text>
                      <Text className="text-2xl font-bold text-slate-900">{Math.floor(analytics.watchTime / 60)} min</Text>
                    </View>
                  </View>
                </View>

              </View>
            </View>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  )
}
