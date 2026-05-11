'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID, Brand } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Plus, Trash2, Building } from 'lucide-react'
import { toast } from 'sonner'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('brands')
      .select('*')
      .eq('workspace_id', WORKSPACE_ID)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (data) setBrands(data)
        setLoading(false)
      })
  }, [supabase])

  async function handleSave() {
    setSaving(true)
    const validBrands = brands.filter(b => b.name.trim() !== '')
    
    // Process upserts and deletes manually or using a better sync
    for (const brand of validBrands) {
      if (brand.id.startsWith('new-')) {
        const { id, ...newBrand } = brand
        await supabase.from('brands').insert({ ...newBrand, workspace_id: WORKSPACE_ID })
      } else {
        await supabase.from('brands').update({ name: brand.name, brand_color: brand.brand_color }).eq('id', brand.id)
      }
    }
    
    toast.success('Brands saved successfully')
    
    // Refresh
    const { data } = await supabase.from('brands').select('*').eq('workspace_id', WORKSPACE_ID)
    if (data) setBrands(data)
    setSaving(false)
  }

  function addBrand() {
    setBrands([
      ...brands,
      {
        id: `new-${Date.now()}`,
        workspace_id: WORKSPACE_ID,
        name: '',
        logo_url: null,
        brand_color: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ])
  }

  function removeBrand(id: string) {
    // If it's a new brand, just remove it from state
    if (id.startsWith('new-')) {
      setBrands(brands.filter(b => b.id !== id))
      return
    }
    // Real deletion
    supabase.from('brands').delete().eq('id', id).then(() => {
      setBrands(brands.filter(b => b.id !== id))
      toast.success('Brand deleted')
    })
  }

  function updateBrand(id: string, field: keyof Brand, value: string) {
    setBrands(brands.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Agency Clients (Brands)</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage the different clients and brands your agency handles.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-blue-500 hover:bg-blue-600">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Clients'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-400" />
            Client List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {brands.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm border rounded-md border-dashed">
              No clients created yet. Add one to start organizing ideas by brand.
            </div>
          ) : (
            <div className="space-y-4">
              {brands.map(brand => (
                <div key={brand.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1 space-y-1.5 w-full">
                    <Label className="text-xs text-slate-500">Client Name</Label>
                    <Input 
                      value={brand.name} 
                      onChange={(e) => updateBrand(brand.id, 'name', e.target.value)} 
                      placeholder="e.g. Acme Corp" 
                    />
                  </div>
                  <div className="w-full sm:w-32 space-y-1.5">
                    <Label className="text-xs text-slate-500">Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-md border border-slate-200 shrink-0 overflow-hidden" style={{ backgroundColor: brand.brand_color || '#3B82F6' }}>
                        <input type="color" value={brand.brand_color || '#3B82F6'} onChange={(e) => updateBrand(brand.id, 'brand_color', e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                      </div>
                      <Input value={brand.brand_color || '#3B82F6'} onChange={(e) => updateBrand(brand.id, 'brand_color', e.target.value)} className="font-mono text-xs" />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeBrand(brand.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-5">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={addBrand} className="mt-2">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Client
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
