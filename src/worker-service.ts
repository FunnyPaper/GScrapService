import { ServerWritableStream, sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { JobManager } from "./job-manager";
import { CancelJobRequest, CancelJobResponse, JobEvent, StartJobRequest, WorkerServiceServer } from "./proto/worker";

const jobManager = new JobManager();

export const workerService: WorkerServiceServer = {
  startJob(call: ServerWritableStream<StartJobRequest, JobEvent>) {
    jobManager.startJob(call.request.jobId, call.request.script, call.request.env, call);
  },
  async cancelJob(call: ServerUnaryCall<CancelJobRequest, CancelJobResponse>, callback: sendUnaryData<CancelJobResponse>) {
    const success = await jobManager.cancelJob(call.request.jobId);
    callback(null, { success });
  }
};
