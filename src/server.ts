import * as grpc from '@grpc/grpc-js';
import { authInterceptor } from './auth-interceptor';
import { WorkerServiceService } from './proto/worker';
import { workerService } from './worker-service';
import { config } from 'dotenv';

config()

const server = new grpc.Server({
    interceptors: [authInterceptor(process.env.GRPC_JWT_SECRET!)],
});
server.addService(WorkerServiceService, workerService);

server.bindAsync(`${process.env.ALLOW}:${process.env.NODE_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) throw err;
    console.log(`gRPC server running on port ${port}`)
})

process.on("SIGINT", () => {
    console.log("Shutting down...");
    server.tryShutdown(() => process.exit(0));
});