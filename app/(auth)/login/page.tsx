"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MessageCircle, Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import { signIn } from "@/lib/actions/auth"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardDescription, NeoCardContent, NeoCardFooter } from "@/components/ui/neo-card"
import { NeoInput } from "@/components/ui/neo-input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append("email", data.email)
        formData.append("password", data.password)

        const result = await signIn(formData)

        if (result?.error) {
            setError(result.error)
            toast.error("Login failed", {
                description: result.error,
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-sidebar p-4 select-none">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex w-20 h-20 rounded-full border-4 border-foreground bg-primary items-center justify-center neo-shadow animate-bounce-slow">
                        <MessageCircle className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mt-6">Kai Admin</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Secure Portal Access</p>
                </div>

                <NeoCard className="border-4">
                    <NeoCardHeader className="space-y-1">
                        <NeoCardTitle className="text-2xl">Login</NeoCardTitle>
                        <NeoCardDescription>Enter your credentials to access the dashboard</NeoCardDescription>
                    </NeoCardHeader>
                    <NeoCardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-[1rem] border-4 border-foreground bg-destructive/10 text-destructive font-bold text-sm">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-black text-sm uppercase tracking-wider">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground z-10" />
                                    <NeoInput
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-12 h-12"
                                        {...register("email")}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-black text-sm uppercase tracking-wider">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground z-10" />
                                    <NeoInput
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-12"
                                        {...register("password")}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.password.message}</p>
                                )}
                            </div>

                            <NeoButton
                                type="submit"
                                className="w-full h-14 text-lg font-black neo-shadow-sm active:neo-shadow-none active:translate-x-1 active:translate-y-1"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Continue to Dashboard"
                                )}
                            </NeoButton>
                        </form>
                    </NeoCardContent>
                    <NeoCardFooter className="flex flex-wrap justify-center gap-2 border-t-4 border-foreground pt-6">
                        <p className="text-xs text-muted-foreground font-medium">
                            Protected by Kai Security Protocols
                        </p>
                    </NeoCardFooter>
                </NeoCard>
            </div>
        </div>
    )
}
