import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { User2, Mail, Shield, Key } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal information, security preferences, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar settings navigation placeholder */}
        <div className="md:col-span-1 space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <User2 className="h-4 w-4" />
            General
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500">
            <Shield className="h-4 w-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500">
            <Mail className="h-4 w-4" />
            Notifications
          </Button>
        </div>

        {/* Content area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <User2 className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <Input defaultValue="Admin User" className="max-w-md" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input defaultValue="admin@clavio.com" type="email" disabled className="max-w-md bg-slate-50 dark:bg-slate-900" />
                <p className="text-xs text-slate-500">Email cannot be changed currently.</p>
              </div>
              <div className="pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Delete Account</h4>
                  <p className="text-sm text-slate-500">Permanently remove your account and all data.</p>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
