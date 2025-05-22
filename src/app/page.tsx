import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Next.js handles the redirect, so no explicit return is needed here.
  // It's good practice that this component doesn't render anything else.
}
