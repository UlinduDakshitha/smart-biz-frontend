export default function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#bbbaca] via-[#696797] to-[#4338ca]" />

      {/* Animated gradient blobs */}
      <div
        className="absolute top-0 right-0 rounded-full w-96 h-96 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-0 rounded-full w-80 h-80 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          animation: "float 8s ease-in-out infinite 1s",
        }}
      />
      <div
        className="absolute rounded-full -top-40 left-1/2 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-15"
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          animation: "float 7s ease-in-out infinite 2s",
        }}
      />

      {/* Geometric pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="dots"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="40" cy="40" r="2" fill="white" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0 bg-radial-gradient opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(79, 172, 254, 0.2), transparent 50%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
