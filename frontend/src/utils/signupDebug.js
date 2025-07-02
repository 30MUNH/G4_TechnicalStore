// SignUp Debug Utility
// This file provides debugging tools for the signup process

export const signupDebugUtils = {
    // Enable/disable debug logging
    enableDebug: () => {
        localStorage.setItem('signupDebugEnabled', 'true');
        console.log('🛠️ Signup debug logging enabled');
    },

    disableDebug: () => {
        localStorage.setItem('signupDebugEnabled', 'false');
        console.log('🛠️ Signup debug logging disabled');
    },

    isDebugEnabled: () => {
        return localStorage.getItem('signupDebugEnabled') === 'true';
    },

    // Debug logger with conditional logging
    log: (type, message, data = null) => {
        if (!signupDebugUtils.isDebugEnabled()) return;

        const timestamp = new Date().toLocaleTimeString();
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            debug: '🔍'
        }[type] || '📝';

        console.group(`${emoji} [${timestamp}] ${message}`);
        if (data) {
            console.log(data);
        }
        console.groupEnd();
    },

    // Check current registration flow state
    checkFlowState: () => {
        const stored = localStorage.getItem('pendingRegistration');
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        console.group('🔍 Registration Flow State Check');

        // Check localStorage registration state
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const ageInMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
                console.log('📦 Pending Registration:', {
                    phone: parsed.phone,
                    username: parsed.username,
                    hasHashedPassword: !!parsed.hashedPassword,
                    timestamp: new Date(parsed.timestamp).toLocaleString(),
                    ageInMinutes: ageInMinutes.toFixed(2),
                    isExpired: ageInMinutes >= 10,
                    status: ageInMinutes >= 10 ? '⏰ EXPIRED' : '✅ VALID'
                });
            } catch (error) {
                console.error('❌ Invalid registration data in localStorage:', error);
            }
        } else {
            console.log('📭 No pending registration found');
        }

        // Check auth state
        console.log('🔑 Authentication State:', {
            hasAuthToken: !!authToken,
            hasUserData: !!userData,
            tokenLength: authToken?.length || 0,
            userData: userData ? JSON.parse(userData) : null
        });

        // Check session storage
        const registrationSuccess = sessionStorage.getItem('registrationSuccess');
        if (registrationSuccess) {
            console.log('🎉 Registration Success State:', JSON.parse(registrationSuccess));
        }

        console.groupEnd();
    },

    // Simulate different registration scenarios for testing
    simulate: {
        // Simulate a pending registration
        pendingRegistration: (username = 'testuser', phone = '+84987654321') => {
            const registrationData = {
                phone,
                username,
                hashedPassword: 'simulated_hash_123',
                timestamp: Date.now()
            };
            localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            console.log('🎭 Simulated pending registration:', registrationData);
        },

        // Simulate an expired registration
        expiredRegistration: (username = 'expireduser', phone = '+84123456789') => {
            const registrationData = {
                phone,
                username,
                hashedPassword: 'expired_hash_123',
                timestamp: Date.now() - (15 * 60 * 1000) // 15 minutes ago
            };
            localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            console.log('🎭 Simulated expired registration:', registrationData);
        },

        // Clear all simulated data
        clear: () => {
            localStorage.removeItem('pendingRegistration');
            sessionStorage.removeItem('registrationSuccess');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            console.log('🧹 All simulated data cleared');
        }
    },

    // Test phone number formatting
    testPhoneFormatting: (testCases = [
        '0987654321',
        '987654321',
        '84987654321',
        '+84987654321',
        '0-987-654-321',
        '(098) 765-4321'
    ]) => {
        console.group('📱 Phone Number Formatting Tests');

        testCases.forEach(testCase => {
            try {
                // Test registration format (allows 10 or 9 digits)
                let formatted = testCase.replace(/\D/g, '');
                if (formatted.startsWith('0')) {
                    formatted = formatted.substring(1);
                } else if (formatted.startsWith('84')) {
                    formatted = formatted.substring(2);
                }

                if (formatted.length === 9) {
                    const result = '+84' + formatted;
                    console.log(`✅ ${testCase} → ${result}`);
                } else {
                    console.log(`❌ ${testCase} → Invalid (${formatted.length} digits)`);
                }
            } catch (error) {
                console.log(`❌ ${testCase} → Error: ${error.message}`);
            }
        });

        console.groupEnd();
    },

    // Monitor API calls
    interceptAPI: () => {
        if (window._signupAPIIntercepted) return;

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url, options] = args;

            // Only log signup-related API calls
            if (typeof url === 'string' && url.includes('/account/')) {
                console.group(`🌐 API Call: ${options?.method || 'GET'} ${url}`);

                if (options?.body) {
                    try {
                        const body = JSON.parse(options.body);
                        console.log('📤 Request Body:', {
                            ...body,
                            password: body.password ? '***' : undefined
                        });
                    } catch (e) {
                        console.log('📤 Request Body:', options.body);
                    }
                }

                try {
                    const response = await originalFetch(...args);
                    const clonedResponse = response.clone();
                    const responseData = await clonedResponse.text();

                    console.log('📨 Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        data: responseData
                    });

                    console.groupEnd();
                    return response;
                } catch (error) {
                    console.error('❌ API Error:', error);
                    console.groupEnd();
                    throw error;
                }
            }

            return originalFetch(...args);
        };

        window._signupAPIIntercepted = true;
        console.log('🕵️ API interceptor enabled for signup debugging');
    },

    // Remove API interception
    removeAPIIntercept: () => {
        if (window._originalFetch) {
            window.fetch = window._originalFetch;
            window._signupAPIIntercepted = false;
            console.log('🕵️ API interceptor removed');
        }
    },

    // Quick setup for debugging
    setup: () => {
        signupDebugUtils.enableDebug();
        signupDebugUtils.interceptAPI();
        console.log('🛠️ Signup debugging setup complete!');
        console.log('💡 Available commands:');
        console.log('   - signupDebugUtils.checkFlowState()');
        console.log('   - signupDebugUtils.testPhoneFormatting()');
        console.log('   - signupDebugUtils.simulate.pendingRegistration()');
        console.log('   - signupDebugUtils.simulate.clear()');
    },

    // Quick teardown
    teardown: () => {
        signupDebugUtils.disableDebug();
        signupDebugUtils.removeAPIIntercept();
        signupDebugUtils.simulate.clear();
        console.log('🧹 Signup debugging teardown complete');
    }
};

// OTP Testing Debug Utils
export const otpDebugUtils = {
    // Generate test OTP (fake 6-digit code)
    generateTestOTP: () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('🎲 Generated test OTP:', otp);
        return otp;
    },

    // Test OTP verification with fake data
    testOTPVerification: async (username, otp = null) => {
        const testOTP = otp || otpDebugUtils.generateTestOTP();
        console.group('🧪 Testing OTP Verification');
        console.log('Input:', { username, otp: testOTP });

        try {
            // Dynamic import to avoid circular dependency
            const { authService } = await import('../services/authService');
            const response = await authService.verifyLogin({ username, otp: testOTP });
            console.log('✅ Test response:', response);
            return { success: true, response };
        } catch (error) {
            console.error('❌ Test error:', error);
            return { success: false, error };
        } finally {
            console.groupEnd();
        }
    },

    // Check pending login state in localStorage/sessionStorage
    checkLoginState: () => {
        console.group('🔍 Current Login State');

        const pendingLogin = sessionStorage.getItem('pendingLogin');
        const authToken = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('user');
        const loginSuccess = sessionStorage.getItem('loginSuccess');

        console.log('Pending Login:', pendingLogin);
        console.log('Auth Token:', authToken ? 'EXISTS (length: ' + authToken.length + ')' : 'NONE');
        console.log('User Info:', userInfo ? JSON.parse(userInfo) : 'NONE');
        console.log('Login Success State:', loginSuccess ? JSON.parse(loginSuccess) : 'NONE');

        console.groupEnd();

        return {
            pendingLogin,
            hasAuthToken: !!authToken,
            userInfo: userInfo ? JSON.parse(userInfo) : null,
            loginSuccess: loginSuccess ? JSON.parse(loginSuccess) : null
        };
    },

    // Clear all login states for fresh test
    clearLoginState: () => {
        console.log('🧹 Clearing all login states...');
        sessionStorage.removeItem('pendingLogin');
        sessionStorage.removeItem('loginSuccess');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        console.log('✅ Login states cleared');
    },

    // Monitor API calls related to OTP
    monitorOTPCalls: () => {
        console.log('👀 Monitoring OTP-related API calls...');

        if (window._otpAPIIntercepted) {
            console.log('⚠️ OTP monitoring already active');
            return;
        }

        const originalFetch = window.fetch;
        window.fetch = function (...args) {
            const url = args[0];
            const options = args[1];

            if (url.includes('verify-login') || url.includes('resend-otp') || url.includes('send-otp') || url.includes('/login')) {
                console.group('📡 OTP API Call Intercepted');
                console.log('URL:', url);
                console.log('Method:', options?.method || 'GET');
                console.log('Headers:', options?.headers);

                if (options?.body) {
                    try {
                        const body = JSON.parse(options.body);
                        console.log('Body:', {
                            ...body,
                            password: body.password ? '***' : body.password,
                            otp: body.otp ? `${body.otp.substring(0, 2)}****` : body.otp
                        });
                    } catch (e) {
                        console.log('Body:', options.body);
                    }
                }
                console.groupEnd();
            }

            return originalFetch.apply(this, args);
        };

        window._otpAPIIntercepted = true;
        console.log('✅ OTP API monitoring active');

        // Return function to stop monitoring
        return () => {
            window.fetch = originalFetch;
            window._otpAPIIntercepted = false;
            console.log('🛑 OTP API monitoring stopped');
        };
    },

    // Quick setup for OTP debugging
    setupOTPDebug: () => {
        otpDebugUtils.monitorOTPCalls();
        console.log('🛠️ OTP debugging setup complete!');
        console.log('💡 Available OTP commands:');
        console.log('   - otpDebugUtils.checkLoginState()');
        console.log('   - otpDebugUtils.generateTestOTP()');
        console.log('   - otpDebugUtils.testOTPVerification(username, otp)');
        console.log('   - otpDebugUtils.clearLoginState()');
    }
};

// Cart Debug Utils
export const cartDebugUtils = {
    // Check why cart API might be failing
    diagnoseProblem: () => {
        console.group('🛒 [CART DEBUG] Problem Diagnosis');

        // Check auth state
        const authToken = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('user');

        console.log('🔐 Authentication Status:', {
            hasToken: !!authToken,
            tokenLength: authToken?.length || 0,
            tokenValid: authToken && authToken.length > 20,
            hasUserInfo: !!userInfo,
            userInfo: userInfo ? JSON.parse(userInfo) : null
        });

        // Check registration flow
        const registrationSuccess = sessionStorage.getItem('registrationSuccess');
        if (registrationSuccess) {
            try {
                const regData = JSON.parse(registrationSuccess);
                const timeSinceReg = Date.now() - regData.timestamp;
                const isBlocking = timeSinceReg < 10000;

                console.log('⏱️ Registration Flow Status:', {
                    hasRegistrationFlag: true,
                    registeredAt: new Date(regData.timestamp).toLocaleString(),
                    timeSinceReg: `${timeSinceReg}ms`,
                    isInGracePeriod: isBlocking,
                    willBlockCartAPI: isBlocking,
                    recommendation: isBlocking ? 'WAIT OR CLEAR REGISTRATION FLAG' : 'Registration flow OK'
                });

                if (isBlocking) {
                    console.warn('🚫 PROBLEM FOUND: Registration grace period is blocking cart API calls');
                    console.log('💡 Solutions:');
                    console.log('   1. Wait 10 seconds after login');
                    console.log('   2. Or run: cartDebugUtils.clearRegistrationFlag()');
                }
            } catch (e) {
                console.error('❌ Invalid registration data:', e);
            }
        } else {
            console.log('✅ No registration flow blocking');
        }

        // Check page context
        const currentPath = window.location.pathname;
        const isAuthPage = ['/login', '/signup'].includes(currentPath);

        console.log('📍 Page Context:', {
            currentPath,
            isAuthPage,
            willBlockAPI: isAuthPage,
            recommendation: isAuthPage ? 'Navigate away from auth pages' : 'Page context OK'
        });

        console.groupEnd();
    },

    // Clear registration flag to stop blocking
    clearRegistrationFlag: () => {
        sessionStorage.removeItem('registrationSuccess');
        console.log('🧹 Registration flag cleared - cart API should work now');
    },

    // Test cart API call manually
    testCartAPI: async () => {
        console.group('🧪 Testing Cart API');

        try {
            const { cartService } = await import('../services/cartService');
            console.log('📞 Making cart API call...');
            const result = await cartService.viewCart();
            console.log('✅ Cart API Success:', result);
            return { success: true, result };
        } catch (error) {
            console.error('❌ Cart API Failed:', error);
            return { success: false, error };
        } finally {
            console.groupEnd();
        }
    },

    // Monitor cart-related API calls
    monitorCartCalls: () => {
        console.log('👀 Monitoring cart-related API calls...');

        if (window._cartAPIIntercepted) {
            console.log('⚠️ Cart monitoring already active');
            return;
        }

        const originalFetch = window.fetch;
        window.fetch = function (...args) {
            const url = args[0];
            const options = args[1];

            if (url.includes('/cart/') || url.includes('cart')) {
                console.group('📡 Cart API Call Intercepted');
                console.log('URL:', url);
                console.log('Method:', options?.method || 'GET');
                console.log('Headers:', options?.headers);

                // Check auth state at call time
                const authToken = localStorage.getItem('authToken');
                console.log('🔐 Auth State:', {
                    hasToken: !!authToken,
                    tokenPreview: authToken ? authToken.substring(0, 20) + '...' : 'NONE'
                });

                console.groupEnd();
            }

            return originalFetch.apply(this, args);
        };

        window._cartAPIIntercepted = true;
        console.log('✅ Cart API monitoring active');

        return () => {
            window.fetch = originalFetch;
            window._cartAPIIntercepted = false;
            console.log('🛑 Cart API monitoring stopped');
        };
    },

    // Complete cart debugging setup
    setupCartDebug: () => {
        cartDebugUtils.monitorCartCalls();
        cartDebugUtils.diagnoseProblem();
        console.log('🛠️ Cart debugging setup complete!');
        console.log('💡 Available Cart commands:');
        console.log('   - cartDebugUtils.diagnoseProblem()');
        console.log('   - cartDebugUtils.testCartAPI()');
        console.log('   - cartDebugUtils.clearRegistrationFlag()');
    }
};

// Auto-setup if debug flag is found in URL
if (typeof window !== 'undefined') {
    if (window.location?.search?.includes('debug=signup')) {
        signupDebugUtils.setup();
    }
    if (window.location?.search?.includes('debug=otp')) {
        otpDebugUtils.setupOTPDebug();
    }
    if (window.location?.search?.includes('debug=cart')) {
        cartDebugUtils.setupCartDebug();
    }

    // Global access for all debug utils
    window.signupDebugUtils = signupDebugUtils;
    window.otpDebugUtils = otpDebugUtils;
    window.cartDebugUtils = cartDebugUtils;
}

// Export for use in components
export default signupDebugUtils; 