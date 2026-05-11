import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { supabase, WORKSPACE_ID } from '../../lib/supabase'
import { router } from 'expo-router'
import { ChevronRight, Clock, CheckCircle2, Plus } from 'lucide-react-native'

type Idea = {
  id: string
  title: string
  status: string
  created_at: string
}

export default function IdeasScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const loadIdeas = () => {
    supabase
      .from('ideas')
      .select('id, title, status, created_at')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setIdeas(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadIdeas()
  }, [])

  const handleCreateIdea = async () => {
    setCreating(true)
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        workspace_id: WORKSPACE_ID,
        title: 'Nouvelle Idée',
        status: 'draft'
      })
      .select()
      .single()
    
    if (data && !error) {
      // Also create a blank variant for the script
      await supabase.from('idea_variants').insert({
        workspace_id: WORKSPACE_ID,
        idea_id: data.id,
        variant_type: 'original',
        status: 'draft'
      })
      router.push(`/idea/${data.id}`)
    }
    setCreating(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-4 border-b border-slate-200 bg-white">
        <Text className="text-xl font-bold text-slate-900">Idées & Scripts</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={ideas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/idea/${item.id}`)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold text-slate-900 mb-1" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    {item.status === 'draft' ? (
                      <Clock size={12} color="#64748b" />
                    ) : (
                      <CheckCircle2 size={12} color="#10b981" />
                    )}
                    <Text className="text-xs text-slate-500 capitalize">{item.status}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-center text-slate-500 mt-10">Aucune idée trouvée.</Text>
            }
          />
          
          <TouchableOpacity 
            onPress={handleCreateIdea}
            disabled={creating}
            className="absolute bottom-28 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
            style={{ shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          >
            {creating ? <ActivityIndicator color="white" /> : <Plus color="white" size={24} strokeWidth={3} />}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}
