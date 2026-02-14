import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch profile by employee_id
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('employee_id', id)
        .single()

    const isValid = profile && !error

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center mb-8">
                    <Image src="/SyncFlo White BG Full.png" alt="SyncFlo Logo" width={140} height={40} className="h-10 w-auto" />
                </div>

                <Card className="border-none shadow-xl overflow-hidden">
                    <div className={`h-2 w-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                    <CardHeader className="pb-4 text-center">
                        <div className="flex justify-center mb-4">
                            {isValid ? (
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {isValid ? 'Verified Employee' : 'Invalid ID'}
                        </CardTitle>
                        <p className="text-slate-500 text-sm">
                            {isValid
                                ? 'This identity is verified by SyncFlo system.'
                                : 'This ID card is not recognized or has been deactivated.'}
                        </p>
                    </CardHeader>

                    {isValid && (
                        <CardContent className="space-y-6 pt-0">
                            <div className="flex flex-col items-center pb-6 border-b border-slate-100">
                                <div className="h-24 w-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 relative mb-3">
                                    {profile.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400 text-2xl font-bold">
                                            {profile.first_name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{profile.first_name} {profile.last_name}</h2>
                                <p className="text-blue-600 font-medium">{profile.company_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Employee ID</p>
                                    <p className="font-mono text-slate-900 bg-slate-100 inline-block px-2 py-1 rounded">{profile.employee_id}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
                                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Active
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Email</p>
                                    <p className="text-slate-900 truncate">{profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Joined</p>
                                    <p className="text-slate-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="h-3 w-3" />
                                <span>Secured by SyncFlo Identity</span>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    )
}
