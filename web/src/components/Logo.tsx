'use client';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showIcon?: boolean;
}

export default function Logo({ size = 'md', showIcon = true }: LogoProps) {
    const sizes = {
        sm: { text: 'text-xl', icon: 24, height: 28 },
        md: { text: 'text-2xl', icon: 30, height: 34 },
        lg: { text: 'text-4xl', icon: 40, height: 44 },
        xl: { text: 'text-5xl', icon: 52, height: 56 },
    };

    const s = sizes[size];

    return (
        <div className="flex items-center gap-2">
            {showIcon && (
                <svg
                    width={s.icon}
                    height={s.icon}
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FD267A" />
                            <stop offset="100%" stopColor="#FF6036" />
                        </linearGradient>
                    </defs>
                    {/* Галын дүрс — Tinder загвар */}
                    <path
                        d="M24 4C24 4 14 16 14 26C14 31.5 18.5 36 24 36C29.5 36 34 31.5 34 26C34 16 24 4 24 4Z"
                        fill="url(#logo-gradient)"
                    />
                    <path
                        d="M24 36C24 36 19 32 19 28C19 24 24 20 24 20C24 20 29 24 29 28C29 32 24 36 24 36Z"
                        fill="white"
                        opacity="0.9"
                    />
                </svg>
            )}
            <span
                className={`${s.text} font-extrabold tracking-tight`}
                style={{
                    background: 'linear-gradient(135deg, #FD267A 0%, #FF6036 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                mimi
            </span>
        </div>
    );
}
