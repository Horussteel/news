// Quick test pentru a verifica dacă Google Calendar API e activ
// Rulează acest script în browser console pe pagina de dashboard

// Test 1: Verifică sesiunea NextAuth
async function checkSession() {
    console.log('🔍 Checking NextAuth session...');
    try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        console.log('✅ Session:', session);
        
        if (session?.accessToken) {
            console.log('🎉 Access token found!');
            return session.accessToken;
        } else {
            console.log('❌ No access token - need to re-authenticate');
            return null;
        }
    } catch (error) {
        console.error('❌ Session check failed:', error);
        return null;
    }
}

// Test 2: Verifică Google Calendar API
async function testCalendarAPI(accessToken) {
    console.log('🔍 Testing Google Calendar API...');
    
    if (!accessToken) {
        console.log('❌ No access token provided');
        return;
    }
    
    try {
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1&singleEvents=true&orderBy=startTime',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Calendar API working! Events:', data.items?.length || 0);
            console.log('📅 Sample event:', data.items[0] || 'No events');
            return true;
        } else {
            const errorData = await response.text();
            console.log('❌ Calendar API error:', response.status, errorData);
            
            if (response.status === 403) {
                console.log('🔧 Calendar API might not be enabled or scope missing');
            } else if (response.status === 401) {
                console.log('🔧 Token expired or invalid - need re-auth');
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Calendar API test failed:', error);
        return false;
    }
}

// Test 3: Forțează re-autentificare
function forceReauth() {
    console.log('🔄 Forcing re-authentication...');
    window.location.href = '/auth/signin';
}

// Test 4: Verifică environment variables (server-side)
async function checkServerConfig() {
    console.log('🔍 Checking server configuration...');
    try {
        const response = await fetch('/api/auth/providers');
        const providers = await response.json();
        console.log('✅ Available providers:', providers);
        
        const googleProvider = providers.find(p => p.id === 'google');
        if (googleProvider) {
            console.log('✅ Google provider configured');
            console.log('📋 Google scopes:', googleProvider.authorization?.params?.scope);
        } else {
            console.log('❌ Google provider not found');
        }
    } catch (error) {
        console.error('❌ Server config check failed:', error);
    }
}

// Rulează toate testele
async function runAllTests() {
    console.log('🚀 Starting Google Calendar API diagnostic...');
    
    // Check server config first
    await checkServerConfig();
    
    // Check session
    const accessToken = await checkSession();
    
    if (accessToken) {
        // Test calendar API
        const calendarWorks = await testCalendarAPI(accessToken);
        
        if (!calendarWorks) {
            console.log('💡 Suggestions:');
            console.log('1. Enable Google Calendar API in Google Cloud Console');
            console.log('2. Check that calendar.readonly scope is included');
            console.log('3. Try re-authenticating with forceReauth()');
            console.log('4. Check .env.local variables');
        }
    } else {
        console.log('💡 Try re-authenticating with forceReauth()');
    }
    
    console.log('🏁 Diagnostic complete!');
}

// Export funcțiile pentru browser console
window.checkSession = checkSession;
window.testCalendarAPI = testCalendarAPI;
window.forceReauth = forceReauth;
window.checkServerConfig = checkServerConfig;
window.runAllTests = runAllTests;

console.log('🎯 Google Calendar diagnostic functions loaded!');
console.log('💡 Run runAllTests() to start diagnosis');
console.log('💡 Or run individual tests: checkSession(), testCalendarAPI(), forceReauth()');
