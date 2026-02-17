export default function TestPage() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(to bottom right, #0a0a0f, #13131a, #0a0a0f)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ec4899' }}>
                ✅ Test Page Working!
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                If you see this, Next.js is running correctly.
            </p>
            <div style={{ 
                padding: '1rem 2rem', 
                background: '#ec4899', 
                borderRadius: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
            }}>
                mimi App - Test Successful
            </div>
            <div style={{ marginTop: '2rem', fontSize: '1rem', opacity: 0.7 }}>
                <p>Backend: http://localhost:3699</p>
                <p>Frontend: http://localhost:3000</p>
            </div>
        </div>
    );
}
