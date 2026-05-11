import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase, WORKSPACE_ID } from '../../lib/supabase'
import { ArrowLeft, Save, UserPlus } from 'lucide-react-native'

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [idea, setIdea] = useState<any>(null)
  const [script, setScript] = useState('')
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    async function loadData() {
      // Load idea
      const { data: ideaData } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .eq('workspace_id', WORKSPACE_ID)
        .single()

      if (ideaData) {
        setIdea(ideaData)
        setScript(ideaData.script || '')
        setAssignedTo(ideaData.assigned_to || null)
      }

      // Load profiles for assignment
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('workspace_id', WORKSPACE_ID)
      
      if (profilesData) {
        setProfiles(profilesData)
      }
      
      setLoading(false)
    }

    loadData()
  }, [id])

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('ideas')
      .update({ script, assigned_to: assignedTo })
      .eq('id', id)
      .eq('workspace_id', WORKSPACE_ID)
    
    setSaving(false)
    if (!error) {
      alert('Script et assignation sauvegardés !')
    } else {
      alert('Erreur lors de la sauvegarde.')
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    )
  }

  if (!idea) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Idée non trouvée.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-500">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const selectedProfile = profiles.find(p => p.id === assignedTo)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="font-semibold text-slate-900 truncate flex-1 mx-2" numberOfLines={1}>
            {idea.title}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving}
            className="bg-blue-600 flex-row items-center px-4 py-2 rounded-full shadow-sm"
          >
            <Save size={16} color="white" />
            <Text className="text-white ml-2 font-medium">{saving ? '...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          
          {/* Assignment Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Assigné à</Text>
            <TouchableOpacity 
              onPress={() => setShowPicker(!showPicker)}
              className="flex-row items-center bg-slate-50 border border-slate-200 p-3 rounded-xl"
            >
              <UserPlus size={20} color={selectedProfile ? '#3b82f6' : '#94a3b8'} />
              <Text className={`ml-3 ${selectedProfile ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                {selectedProfile ? (selectedProfile.full_name || selectedProfile.email) : 'Assigner à un membre...'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <View className="mt-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <TouchableOpacity 
                  onPress={() => { setAssignedTo(null); setShowPicker(false); }}
                  className="p-3 border-b border-slate-100"
                >
                  <Text className="text-slate-500 italic">Personne (Désassigner)</Text>
                </TouchableOpacity>
                {profiles.map(p => (
                  <TouchableOpacity 
                    key={p.id}
                    onPress={() => { setAssignedTo(p.id); setShowPicker(false); }}
                    className={`p-3 border-b border-slate-100 ${assignedTo === p.id ? 'bg-blue-50' : ''}`}
                  >
                    <Text className={`text-slate-900 ${assignedTo === p.id ? 'font-semibold text-blue-700' : ''}`}>
                      {p.full_name || p.email}
                    </Text>
                  </TouchableOpacity>
                ))}
                {profiles.length === 0 && (
                  <View className="p-3">
                    <Text className="text-slate-500 text-sm">Aucun profil trouvé dans le workspace.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Text className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Script</Text>
          <TextInput
            value={script}
            onChangeText={setScript}
            multiline
            placeholder="Écrivez votre script ici..."
            className="text-base text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[300px]"
            textAlignVertical="top"
          />
          <View className="h-40" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
