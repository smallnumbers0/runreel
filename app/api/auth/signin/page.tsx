import { redirect } from 'next/navigation'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const params = await searchParams

  // If there's an error, redirect to home with error
  if (params.error) {
    redirect(`/?error=${params.error}`)
  }

  // Otherwise redirect to home
  redirect('/')
}