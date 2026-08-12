import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useGetMe } from "@workspace/api-client-react";
import { Shield, Bell, Users, Database, Globe, Key, Mail, Save, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: user } = useGetMe();
  const isSuper = user?.role === 'super_admin' || user?.role === 'platform_admin';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout activeTab="settings">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">Tenant Settings</h1>
          <p className="font-mono text-sm text-zinc-400">Configure workflow, notifications, and tenant preferences.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-card border border-border p-1 rounded-lg">
            <TabsTrigger value="general" className="px-4 py-2">General</TabsTrigger>
            <TabsTrigger value="notifications" className="px-4 py-2">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="px-4 py-2">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="px-4 py-2">Integrations</TabsTrigger>
            {isSuper && <TabsTrigger value="platform" className="px-4 py-2">Platform</TabsTrigger>}
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Tenant Information</CardTitle>
                <CardDescription>Basic details about your lending entity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">Tenant Name</Label>
                    <Input id="tenantName" defaultValue={user?.tenantName || 'CapitalFirst NBFC'} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantDomain">Custom Domain</Label>
                    <Input id="tenantDomain" placeholder="yourbrand.lendingos.dev" defaultValue={user?.tenantName?.toLowerCase().replace(/\s+/g, '') + '.lendingos.dev'} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantType">Entity Type</Label>
                    <select id="tenantType" className="w-full bg-background border border-border px-3 py-2 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="nbfc">NBFC</option>
                      <option value="bank">Bank</option>
                      <option value="fintech">FinTech</option>
                      <option value="lsp">Lending Service Provider</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select id="timezone" className="w-full bg-background border border-border px-3 py-2 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Operational Settings</CardTitle>
                <CardDescription>Configure core lending operations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <select id="defaultCurrency" className="w-full bg-background border border-border px-3 py-2 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestCalculation">Interest Calculation</Label>
                    <select id="interestCalculation" className="w-full bg-background border border-border px-3 py-2 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="reducing">Reducing Balance</option>
                      <option value="flat">Flat Rate</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-mono text-xs uppercase text-zinc-400">Automation Rules</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Auto-approve low-risk applications</p>
                        <p className="text-sm text-zinc-400">Automatically approve applications with risk grade A1-A2</p>
                      </div>
                      <Switch defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Auto-disbursement on approval</p>
                        <p className="text-sm text-zinc-400">Trigger disbursement immediately after approval</p>
                      </div>
                      <Switch />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Payment reminders</p>
                        <p className="text-sm text-zinc-400">Send SMS/Email reminders 3 days before due date</p>
                      </div>
                      <Switch defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">NPA classification</p>
                        <p className="text-sm text-zinc-400">Auto-classify loans {'>'}90 DPD as NPA</p>
                      </div>
                      <Switch defaultChecked />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Channels</CardTitle>
                <CardDescription>Configure how you receive alerts and updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive alerts via email', enabled: true },
                    { id: 'sms', label: 'SMS Alerts', desc: 'Critical alerts via SMS', enabled: true },
                    { id: 'webhook', label: 'Webhook Events', desc: 'Send events to your endpoint', enabled: false },
                    { id: 'slack', label: 'Slack Integration', desc: 'Post to Slack channels', enabled: false },
                    { id: 'in_app', label: 'In-App Notifications', desc: 'Show in notification center', enabled: true },
                  ].map((ch) => (
                    <label key={ch.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{ch.label}</p>
                          <p className="text-sm text-zinc-400">{ch.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked={ch.enabled} />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Email Templates</CardTitle>
                <CardDescription>Customize transactional email templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Application Submitted',
                  'Application Approved',
                  'Application Rejected',
                  'KYC Pending',
                  'Disbursement Initiated',
                  'Payment Due Reminder',
                  'Payment Received',
                  'Overdue Notice',
                ].map((template) => (
                  <div key={template} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <span className="font-mono text-sm text-zinc-300">{template}</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Access Control</CardTitle>
                <CardDescription>Manage team access and authentication policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue="60" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Enforce 2FA for all users</p>
                      <p className="text-sm text-zinc-400">Require two-factor authentication</p>
                    </div>
                    <Switch defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">IP Allowlist</p>
                      <p className="text-sm text-zinc-400">Restrict access to approved IP ranges</p>
                    </div>
                    <Switch />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Audit log retention</p>
                      <p className="text-sm text-zinc-400">Keep audit logs for 7 years (regulatory)</p>
                    </div>
                    <Switch defaultChecked />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> API Keys</CardTitle>
                <CardDescription>Manage API credentials for integrations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <div>
                      <p className="font-mono text-sm text-white">Production API Key</p>
                      <p className="text-xs text-zinc-500">Created 15 days ago • Last used 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Rotate</Button>
                      <Button variant="outline" size="sm">Revoke</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <div>
                      <p className="font-mono text-sm text-white">Development API Key</p>
                      <p className="text-xs text-zinc-500">Created 45 days ago • Last used 1 day ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Rotate</Button>
                      <Button variant="outline" size="sm">Revoke</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">+ Generate New API Key</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Data Providers</CardTitle>
                <CardDescription>Configure credit bureau, KYC, and banking integrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'CIBIL', category: 'Credit Bureau', status: 'connected', config: 'Production' },
                  { name: 'Experian', category: 'Credit Bureau', status: 'connected', config: 'Sandbox' },
                  { name: 'Karza', category: 'KYC & Verification', status: 'connected', config: 'Production' },
                  { name: 'Perfios', category: 'Bank Statement Analysis', status: 'pending', config: 'Not Configured' },
                  { name: 'DigiLocker', category: 'Document Verification', status: 'connected', config: 'Production' },
                  { name: 'SignDesk', category: 'E-Signature', status: 'disconnected', config: 'Not Configured' },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{provider.name}</p>
                        <p className="text-sm text-zinc-400">{provider.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={provider.status === 'connected' ? 'default' : provider.status === 'pending' ? 'secondary' : 'outline'}>
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </Badge>
                      <span className="font-mono text-xs text-zinc-500">{provider.config}</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Communication</CardTitle>
                <CardDescription>SMS and email gateway configuration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Twilio', type: 'SMS', status: 'connected' },
                  { name: 'SendGrid', type: 'Email', status: 'connected' },
                  { name: 'WhatsApp Business', type: 'Messaging', status: 'pending' },
                ].map((comm) => (
                  <div key={comm.name} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{comm.name}</p>
                        <p className="text-sm text-zinc-400">{comm.type} Gateway</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={comm.status === 'connected' ? 'default' : 'secondary'}>
                        {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {isSuper && (
            <TabsContent value="platform" className="mt-6 space-y-6">
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-destructive" /> Platform Administration</CardTitle>
                  <CardDescription>Global platform settings. Changes affect all tenants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Maintenance Mode</p>
                        <p className="text-sm text-zinc-400">Disable all tenant access except platform admins</p>
                      </div>
                      <Switch />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-white">New Tenant Auto-Approval</p>
                        <p className="text-sm text-zinc-400">Automatically approve new tenant registrations</p>
                      </div>
                      <Switch />
                    </label>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input id="platformName" defaultValue="LendingOS" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input id="supportEmail" type="email" defaultValue="support@lendingos.example" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTenants">Max Tenants</Label>
                      <Input id="maxTenants" type="number" defaultValue="500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => {}}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}