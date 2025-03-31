import { Logger } from "@aws-lambda-powertools/logger";

let loggerInstance: Logger | null = null;

export function getLogger(service?: string): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger({
      serviceName: service ?? "real-time-chat-demo",
    });
  }
  return loggerInstance;
}
