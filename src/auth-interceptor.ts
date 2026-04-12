import {
    ServerInterceptingCallInterface,
    ServerMethodDefinition,
    ServerInterceptingCall,
    status,
    Metadata
} from '@grpc/grpc-js';
import { PartialStatusObject } from '@grpc/grpc-js/build/src/call-interface';
import { ResponderBuilder, ServerListenerBuilder } from '@grpc/grpc-js/build/src/server-interceptors';
import * as jwt from 'jsonwebtoken';

export function authInterceptor(secret: string) {
    return function (
        method: ServerMethodDefinition<any, any>,
        call: ServerInterceptingCallInterface
    ): ServerInterceptingCall {
        const requester = (new ResponderBuilder())
            .withStart((listener) => {
                const serverListener = new ServerListenerBuilder()
                    .withOnReceiveMetadata((metadata: Metadata, next: (metadata: Metadata) => void) => {
                        try {
                            const authHeader = metadata.get('authorization')[0] as string;

                            if (!authHeader?.startsWith('Bearer ')) {
                                call.sendStatus({
                                    code: status.UNAUTHENTICATED,
                                    details: 'Missing auth token',
                                } as PartialStatusObject);
                                return;
                            }

                            const token = authHeader.slice(7);
                            const payload = jwt.verify(token, secret);

                            const scope = (payload as jwt.JwtPayload).scope as string[] || [];
                            scope.forEach(s => metadata.set('scope', s));
                        } catch (err) {
                            call.sendStatus({
                                code: status.UNAUTHENTICATED,
                                details: 'Invalid or expired token',
                            } as PartialStatusObject);
                        }

                        next(metadata)
                    }).build();

                listener(serverListener)
            }).build()

        return new ServerInterceptingCall(call, requester);
    };
}
