export interface CrossDomainMessage {
    type: 'LOGOUT_REQUEST' | 'LOGOUT_COMPLETE' | 'CLEAR_REDUX_STATE' | 'HEALTH_CHECK' | 'LOGOUT_BROADCAST';
    payload?: LogoutPayload | LogoutCompletePayload;
    source?: string;
    timestamp?: number;
}

export interface LogoutPayload {
    userId?: string;
    reason?: 'manual' | 'session_expired' | 'security';
    domains?: string[];
    source?: string;
}

export interface LogoutCompletePayload {
    domain: string;
    timestamp: number;
    error?: string;
}