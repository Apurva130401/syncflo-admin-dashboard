'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, User, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: true,
    })

    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'SyncFlo Inc.',
    })

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-slate-600 mt-2 text-lg">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Settings
                        </CardTitle>
                        <CardDescription>Update your personal information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                            />
                        </div>
                        <Button className="w-full">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive updates via email</p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive push notifications</p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>SMS Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive text messages</p>
                            </div>
                            <Switch
                                checked={notifications.sms}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your account security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="w-full">Update Password</Button>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="justify-start">
                                    Light
                                </Button>
                                <Button variant="outline" className="justify-start">
                                    Dark
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <select className="w-full p-2 border rounded-md">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <Button className="w-full">Save Preferences</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}