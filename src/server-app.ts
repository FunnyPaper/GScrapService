import * as grpc from '@grpc/grpc-js';
import { authInterceptor } from './auth-interceptor';
import { WorkerServiceService } from './proto/worker';
import { workerService } from './worker-service';
import { config } from 'dotenv';
import { resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import net from 'net';

async function main() {
    const argv = yargs(hideBin(process.argv))
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
        .option("ack", {
            type: "boolean",
            default: false,
            description: "Should the service send a tcp ping once started."
        })
        .option("ack-host", {
            type: "string",
            default: "127.0.0.1",
            description: "Host address to send ack ping to. Ignored if [ack] is set to false."
        })
        .option("ack-port", {
            type: "number",
            default: 9908,
            description: "Port number to send ack ping to. Ignored if [ack] is set to false."
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
        console.log(`gRPC server running on port ${port}`);

        // If ack is set then sends port informations through socket connection
        if (argv.ack) {
            const ackPort = argv['ack-port'];
            const ackHost = argv['ack-host'];

            const client = net.createConnection(
                { port: ackPort, host: ackHost },
                () => {
                    client.write(`PORT=${port}`);
                    client.end();
                }
            )
        }
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