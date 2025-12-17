'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

/* ---------------- Schema ---------------- */

const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required')
    .refine(
      value =>
        /\S+@\S+\.\S+/.test(value) || /^[0-9]{10,15}$/.test(value),
      'Enter a valid email or phone number'
    ),
  password: z.string().min(1, 'Password is required')
})

type SignInForm = z.infer<typeof signInSchema>

/* ---------------- Component ---------------- */

export default function SignInPage () {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: 'onSubmit'
  })

  const onSubmit = (data: SignInForm) => {
    console.log(data)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4'>
      <div className='relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur'>
        <div className='pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-sky-500/20 blur-3xl' />

        <div className='relative space-y-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40'>
              <span className='text-sm font-semibold text-emerald-300'>L</span>
            </div>
            <h1 className='text-xl font-semibold tracking-tight'>
              Sign in to LendFlow
            </h1>
            <p className='text-xs text-slate-400'>
              Continue your loan journey
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-3'
            autoComplete='off'
          >
            {/* Email / Phone */}
            <div className='space-y-1'>
              <label
                htmlFor='identifier'
                className='text-xs text-slate-400'
              >
                Email or phone number
              </label>
              <input
                id='identifier'
                type='text'
                {...register('identifier')}
                autoComplete='off'
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400'
              />
              {errors.identifier && (
                <p className='text-xs text-red-400'>
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-1'>
              <label
                htmlFor='password'
                className='text-xs text-slate-400'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                {...register('password')}
                autoComplete='current-password'
                className='w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400'
              />
              {errors.password && (
                <p className='text-xs text-red-400'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type='submit'
              className='w-full rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-300'
            >
              Sign in
            </button>
          </form>

          {/* Footer */}
          <div className='flex justify-between text-xs text-slate-400'>
            <Link href='/' className='hover:text-slate-200'>
              ← Back to home
            </Link>
            <Link
              href='/signup'
              className='text-emerald-300 hover:text-emerald-200'
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
