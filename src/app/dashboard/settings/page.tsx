'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Shield, Phone, Mail, Building, Camera, PenLine, Upload, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import QRCode from 'react-qr-code'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const supabase = createClient()

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        company_name: '',
        personal_phone: '',
        avatar_url: '',
        employee_id: '',
        created_at: ''
    })

    // Cropper State
    const [cropImage, setCropImage] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isCropping, setIsCropping] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, email, company_name, personal_phone, avatar_url, employee_id')
                        .eq('id', user.id)
                        .single()

                    if (profileData) {
                        setProfile({
                            first_name: profileData.first_name || '',
                            last_name: profileData.last_name || '',
                            email: profileData.email || '',
                            company_name: profileData.company_name || 'SyncFlo Inc.',
                            personal_phone: profileData.personal_phone || '',
                            avatar_url: profileData.avatar_url || '',
                            employee_id: profileData.employee_id || generateEmployeeId(),
                            created_at: user.created_at || new Date().toISOString()
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [supabase])

    const generateEmployeeId = () => {
        return 'SF-' + Math.floor(1000 + Math.random() * 9000)
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setCropImage(reader.result as string)
                setIsCropping(true)
            })
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new window.Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob((file) => {
                if (file) resolve(file)
                else reject('Canvas is empty')
            }, 'image/jpeg')
        })
    }

    const handleCropSave = async () => {
        try {
            setSaving(true)
            if (!cropImage || !croppedAreaPixels) return

            const croppedImageBlob = await getCroppedImg(cropImage, croppedAreaPixels)
            const fileName = `${Math.random()}.jpg`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedImageBlob)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setProfile({ ...profile, avatar_url: urlData.publicUrl })
            setIsCropping(false)
            setCropImage(null)
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = ''

        } catch (e) {
            console.error(e)
            alert('Error cropping/uploading image')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        first_name: profile.first_name,
                        last_name: profile.last_name,
                        company_name: profile.company_name,
                        personal_phone: profile.personal_phone,
                        avatar_url: profile.avatar_url,
                        employee_id: profile.employee_id
                    })
                    .eq('id', user.id)

                if (error) {
                    console.error('Error updating profile:', error)
                    alert('Failed to update profile')
                } else {
                    setIsEditing(false)
                    alert('Profile updated successfully!')
                }
            }
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred')
        } finally {
            setSaving(false)
        }
    }

    // Generate QR Code Data (Verification Link)
    const qrData = `https://admin.syncflo.xyz/verify/${profile.employee_id}`

    if (loading) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-6 w-96" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column Skeleton */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                        {/* ID Card Skeleton */}
                        <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden border border-slate-200 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-8 w-24" />
                                <div className="flex flex-col items-end gap-2">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                            <div className="space-y-2 mt-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-auto pt-3 border-t border-slate-100/50 mr-20">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-slate-600 mt-2 text-lg">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Virtual ID Card */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-lg font-semibold text-slate-900">Digital ID Card</Label>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                            {isEditing ? 'Cancel Edit' : <><PenLine className="h-4 w-4" /> Edit Profile</>}
                        </Button>
                    </div>

                    {/* ID Card Component */}
                    <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 group bg-white border border-slate-200">
                        {/* Background Design */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 opacity-80" />
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            {/* Watermark Logo */}
                            <Image src="/SyncFlo White BG.png" alt="Watermark" width={120} height={40} className="grayscale opacity-50" />
                        </div>

                        {/* Card Content - Compacted Layout */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                            {/* Top Section */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <Image src="/SyncFlo White BG.png" alt="Logo" width={90} height={28} className="h-9 w-auto object-contain" />
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="h-20 w-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center relative group">
                                        {profile.avatar_url ? (
                                            <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-400">{profile.first_name[0]}</span>
                                        )}
                                    </div>
                                    <div className="px-3 py-1 bg-slate-900 text-white rounded-md text-[10px] font-mono tracking-widest shadow-sm">
                                        {profile.employee_id || 'SF-XXXX'}
                                    </div>
                                </div>
                            </div>

                            {/* Middle Section - User Details */}
                            <div className="space-y-1 mt-2">
                                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-0.5">Name</p>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                                    {profile.first_name} {profile.last_name}
                                </h2>
                                <p className="text-blue-600 font-medium text-sm mt-0.5">{profile.company_name}</p>
                            </div>

                            {/* QR Code - Absolutely Positioned Bottom Right - Slightly smaller and better positioned */}
                            <div className="absolute bottom-5 right-5">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                    <QRCode value={qrData} size={64} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                </div>
                            </div>

                            {/* Bottom Section - Contact Info - Reduced margins/padding */}
                            <div className="grid grid-cols-1 gap-2 mt-auto pt-3 border-t border-slate-100/50 mr-20">
                                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <Mail className="h-3 w-3" />
                                    </div>
                                    <span className="truncate max-w-[180px]">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <Phone className="h-3 w-3" />
                                    </div>
                                    <span className={`truncate max-w-[180px] ${!profile.personal_phone ? 'text-slate-400 italic' : ''}`}>
                                        {profile.personal_phone || 'Add Phone Number'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Holographic Strip / Decorative */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-80" />
                    </div>
                </div>

                {/* Edit Form (Visible only when editing) */}
                {isEditing ? (
                    <Card className="animate-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Edit Information</CardTitle>
                            <CardDescription>Update your ID card details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input value={profile.company_name} disabled className="bg-slate-100/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employee ID</Label>
                                    <Input value={profile.employee_id} disabled className="bg-slate-100/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={profile.personal_phone} onChange={e => setProfile({ ...profile, personal_phone: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Profile Picture</Label>
                                <Input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} />
                            </div>

                            <div className="pt-2">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile} disabled={saving}>
                                    {saving ? 'Saving...' : 'Update ID Card'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Security Settings (Visible when NOT editing) */
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
                )}
            </div>

            {/* Crop Dialog */}
            <Dialog open={isCropping} onOpenChange={setIsCropping}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Profile Picture</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-80 bg-slate-100 rounded-md overflow-hidden">
                        {cropImage && (
                            <Cropper
                                image={cropImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>
                    <div className="py-4">
                        <Label>Zoom</Label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropping(false)}>Cancel</Button>
                        <Button onClick={handleCropSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save & Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}