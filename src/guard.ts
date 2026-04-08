import * as grpc from '@grpc/grpc-js';
import { ServerUnaryCall } from '@grpc/grpc-js';

export function requireScope(scope: string[], call: ServerUnaryCall<unknown, unknown>) {
    const requestedScope = call.metadata.get('scope') as string[];
    const granted = scope.every(s => requestedScope.includes(s));

    return granted
        ? { granted }
        : { 
            granted, 
            code: grpc.status.PERMISSION_DENIED,
            message: 'Scope not met'
        };
}