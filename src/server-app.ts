import * as grpc from '@grpc/grpc-js';
import { authInterceptor } from './auth-interceptor';
import { WorkerServiceService } from './proto/worker';
import { workerService } from './worker-service';
import { config } from 'dotenv';
import { resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .scriptName("gscrap-service")
        .version("0.1.0")
        .alias("v", "version")
        .help("h")
        .alias("h", "help")
        .option("cwd", {
            type: "string",
            default: process.cwd(),
            description: "Path to current working directory. Used for resolving additional files."
        })
        .option("allow", {
            type: "string",
            default: process.env.ALLOW,
            description: "Host allowed to bind."
        })
        .option("node-port", {
            type: "number",
            default: process.env.NODE_PORT,
            description: "Port number for service to start."
        })
        .option("grpc-token-secret", {
            type: "string",
            default: process.env.GRPC_JWT_SECRET,
            description: "Secret used for checking short lived tokens."
        })
        .argv;

    config({ path: resolve(argv.cwd ?? process.cwd(), '.env') })

    const options = {
        grpcTokenSecret: argv['grpc-token-secret'] ?? process.env.GRPC_JWT_SECRET,
        allow: argv.allow ?? process.env.ALLOW,
        nodePort: argv['node-port'] ?? process.env.NODE_PORT
    }

    const server = new grpc.Server({
        interceptors: [authInterceptor(options.grpcTokenSecret!)],
    });
    server.addService(WorkerServiceService, workerService);

    server.bindAsync(`${options.allow}:${options.nodePort}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) throw err;
        console.log(`gRPC server running on port ${port}`)
    })

    process.on("SIGINT", () => {
        console.log("Shutting down...");
        server.tryShutdown(() => process.exit(0));
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
})