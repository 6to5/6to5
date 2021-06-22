import dryErrorMessages from "./rules/dry-error-messages";
import reportErrorMessageFormat from "./rules/report-error-message-format";

export const rules = {
  "dry-error-messages": dryErrorMessages,
  "report-error-message-format": reportErrorMessageFormat,
};

export default { rules };
