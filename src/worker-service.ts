import { ServerWritableStream, sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { JobManager } from "./job-manager";
import { CancelJobRequest, CancelJobResponse, GetScriptValidationSchemaRequest, JobEvent, StartJobRequest, WorkerServiceServer } from "./proto/worker";
import { requireScope } from "./guard";

export type WorkerServiceProvider = (appDir: string, globalOptions?: { cacheDir?: string, headless?: boolean }) => WorkerServiceServer;

export const workerService: WorkerServiceProvider = (appDir, globalOptions) => {
    const jobManager = new JobManager(appDir, globalOptions);
    return {
        startJob(call: ServerWritableStream<StartJobRequest, JobEvent>) {
            const access = requireScope(['run:start'], call);

            if (access.granted) {
                jobManager.startJob(call.request.jobId, call.request.script, call.request.env, call);
            } else {
                call.emit('error', {
                    code: access.code,
                    message: access.message
                })
            }
        },
        async cancelJob(call: ServerUnaryCall<CancelJobRequest, CancelJobResponse>, callback: sendUnaryData<CancelJobResponse>) {
            const access = requireScope(['run:cancel'], call);

            if (access.granted) {
                const success = await jobManager.cancelJob(call.request.jobId);
                callback(null, { success });
            } else {
                callback({ code: access.code, message: access.message });
            }
        },
        getScriptValidationSchema(call: ServerUnaryCall<GetScriptValidationSchemaRequest, Record<string, any>>, callback: sendUnaryData<Record<string, any>>) {
            const access = requireScope(['script:validate'], call);

            if (access.granted) {
                const schema = jobManager.getScriptValidationSchema(call.request.version);
                callback(null, schema);
            } else {
                callback({ code: access.code, message: access.message });
            }
        }
    }
};
