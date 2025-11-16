"use client";

export function LoginForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your account</p>
      </div>

      <div className="space-y-4">
        {/* Auth0 Sign In Button */}

        <a
          href="/api/auth/login"
          className="flex w-full items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In with Auth0
        </a>

        {/* Auth0 Sign Up Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">Don&apos;t have an account? </span>

          <a
            href="/auth/login?screen_hint=signup"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
