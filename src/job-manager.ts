import { ServerWritableStream } from "@grpc/grpc-js";
import { JobEvent, JobEventType, JobStatus, LogType, StatusType } from "./proto/worker";
import { GScrapConfigScheme, GScrapRunner, GScrapRunnerStatuses, updateVars, varsLeft } from "@gscrap/core";

const statusMapper = {
    [GScrapRunnerStatuses.CANCELLED]: JobStatus.CANCELLED,
    [GScrapRunnerStatuses.COMPLETED]: JobStatus.COMPLETED,
    [GScrapRunnerStatuses.FAILED]: JobStatus.FAILED,
    [GScrapRunnerStatuses.STARTED]: JobStatus.STARTED,
    [GScrapRunnerStatuses.UNKNOWN]: JobStatus.UNKNOWN
}

const logTypeMapper = {
    info: LogType.INFO,
    warn: LogType.WARN,
    error: LogType.ERROR
}

export class JobManager {
    private runners: Map<string, GScrapRunner> = new Map();

    async startJob(
        jobId: string,
        script: Record<string, any> | undefined,
        env: Record<string, any> | undefined,
        stream: ServerWritableStream<any, JobEvent>
    ) {
        if (!script) {
            stream.write({
                jobId,
                type: JobEventType.LOG,
                log: {
                    type: LogType.ERROR,
                    message: 'Cannot process empty config'
                }
            });
            stream.write({
                jobId,
                type: JobEventType.STATUS_CHANGE,
                status: JobStatus.FAILED
            });
            stream.end();
            return;
        }

        if (env && varsLeft(script)) {
            updateVars(script, env);
        }

        const validateConfig = GScrapConfigScheme.safeParse(script);

        if (!validateConfig.success) {
            stream.write({
                jobId,
                type: JobEventType.LOG,
                log: {
                    type: LogType.ERROR,
                    message: 'Invalid config passed.'
                }
            });
            stream.write({
                jobId,
                type: JobEventType.STATUS_CHANGE,
                status: JobStatus.FAILED
            });
            stream.end();
            return;
        }

        const runner = new GScrapRunner(validateConfig.data, jobId);

        runner.on('log', ({ type, message }) => {
            stream.write({
                jobId,
                type: JobEventType.LOG,
                log: {
                    type: logTypeMapper[type] ?? LogType.UNRECOGNIZED,
                    message
                }
            })
        });

        runner.on('resultUpdate', ({ data }) => {
            stream.write({
                jobId,
                type: JobEventType.RESULT_UPDATE,
                payload: {
                    type: StatusType.PARTIAL,
                    data
                }
            });
        });

        runner.on('statusChange', ({ status }) => {
            stream.write({
                jobId,
                type: JobEventType.STATUS_CHANGE,
                status: statusMapper[status] ?? JobStatus.UNRECOGNIZED
            })
        });

        this.runners.set(jobId, runner);

        await runner.run();
        runner.removeAllListeners()

        stream.write({
            jobId,
            type: JobEventType.RESULT_UPDATE,
            payload: {
                type: StatusType.FULL,
                data: runner.data
            }
        });
        stream.end();
    }

    async cancelJob(jobId: string): Promise<boolean> {
        if (this.runners.has(jobId)) {
            const runner = this.runners.get(jobId);
            await runner!.cancel();
            return this.runners.delete(jobId);
        } else {
            return false;
        }
    }

    getScriptValidationSchema(version: string) {
        return GScrapConfigScheme.toJSONSchema();
    }
}
