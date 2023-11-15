("use strict");

const _hasOwnProperty = Object.prototype.hasOwnProperty;

const Status = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNSUPPORTED_ACTION: 405,
  VALIDATION_FAILED: 422,
  SERVER_ERROR: 500,
  CREATED: 201,
  PROXY_ERROR: 502,
  MAINTENANCE_MODE: 503,
};

export const Message = {
  ValidationError: "Validation error",
  UserExist: "User already exists",
  CreateAccount: "Account has been created successfully",
  UserNotFound: "User does not exist",
  LoginSuccess: "login successfully!",
  Verified: "Verification Successful!",
  UpdateSuccessful: "Update Successful!",
  ServerError: "Internal server error ",
  UserFieldTaken: "Email or Username is already taken",
  NotAuthorized: "Not authorized",
  AccessGiven: "Access given successfully!",
  Fetched: "Fetched successfully!",
  Created: "Created Successfully!",
  Delete: "Deleted Successfully!",
  NotFound: "Not Found",
  ImageNotFound: "Image Not Found",
  Found: "Found Successfully",
  AccessDenied: "Access Denied",
  UserBlocked: "User Blocked",
  PermissionDenied: "Permission Denied",
  ProxyError: "Proxy Error",
  MaintenanceMode: "app is temporarily unavailable due to planned maintenance",
  ServerDown: "Server Down",
};

function statusMessage(status: number) {
  switch (status) {
    case Status.BAD_REQUEST:
      return "Ba";
    case Status.UNAUTHORIZED:
      return "Unauthorized";
    case Status.FORBIDDEN:
      return "Forbidden";
    case Status.NOT_FOUND:
      return "Not Found";
    case Status.UNSUPPORTED_ACTION:
      return "Unsupported Action";
    case Status.VALIDATION_FAILED:
      return "Validation Failed";
    case Status.SERVER_ERROR:
      return "Internal Server Error";
    case Status.CREATED:
      return "Created";
    case Status.MAINTENANCE_MODE:
      return "maintenance mode";
  }
}

function jsonResponse(
  res: any,
  body: any,
  message: string,
  options: any
) {
  options = options || {};
  options.status = options.status || Status.OK;

  let success: boolean;
  if (options.status === Status.OK) {
    success = true;
  } else {
    success = false;
  }
  return res
    ?.status(options.status)
    ?.json({ success: success, data: body || null, message: message || "" });
}

const Api = {
  ok(res: any, data: any, message: any) {
    jsonResponse(res, data, message, {
      status: Status.OK,
    });
  },

  badRequest(res: any, errors: any, message: string) {
    errors = Array.isArray(errors) ? errors : [errors];

    const body = {
      message: statusMessage(Status.BAD_REQUEST),
      errors,
    };

    jsonResponse(res, body, message, {
      status: Status.BAD_REQUEST,
    });
  },

  unauthorized(res: any, error: string, message: string) {
    const body = {
      message: statusMessage(Status.UNAUTHORIZED),
      error,
    };

    jsonResponse(res, body, message, {
      status: Status.UNAUTHORIZED,
    });
  },

  forbidden(request: any, res: any, message: string) {
    const body = {
      message: statusMessage(Status.FORBIDDEN),
    };

    jsonResponse(res, body, message, {
      status: Status.FORBIDDEN,
    });
  },
  notFound(request: any, res: any, message: string) {
    const body = {
      message: statusMessage(Status.NOT_FOUND),
    };

    jsonResponse(res, body, message, {
      status: Status.NOT_FOUND,
    });
  },

  unsupportedAction(request: any, res: any, message: string) {
    const body = {
      message: statusMessage(Status.UNSUPPORTED_ACTION),
    };

    jsonResponse(res, body, message, {
      status: Status.UNSUPPORTED_ACTION,
    });
  },

  invalid(
    request: any,
    res: any,
    errors: (string & any[]) | string[],
    message: string
  ) {
    errors = Array.isArray(errors) ? errors : [errors];

    const body = {
      message: statusMessage(Status.VALIDATION_FAILED),
      errors,
    };

    jsonResponse(res, body, message, {
      status: Status.VALIDATION_FAILED,
    });
  },
  serverError(request: any, res: any, error: any, message: string) {
    if (error instanceof Error) {
      error = {
        message: error.message,
      };
    }
    const body = {
      message: statusMessage(Status.SERVER_ERROR),
      error,
    };

    jsonResponse(res, body, message, {
      status: Status.SERVER_ERROR,
    });
  },
  proxyError(res: any) {
    jsonResponse(res, null, Message.ProxyError, {
      status: Status.PROXY_ERROR,
    });
  },

  requireParams(
    message: string,
    request: any,
    res: any,
    parameters: any,
    next: any
  ) {
    const missing = [] as any;

    parameters = Array.isArray(parameters) ? parameters : [parameters];

    parameters.forEach((parameter: any) => {
      if (
        !(request.body && _hasOwnProperty.call(request.body, parameter)) &&
        !(request.params && _hasOwnProperty.call(request.params, parameter)) &&
        !_hasOwnProperty.call(request.query, parameter)
      ) {
        missing.push(`Missing required parameter: ${parameter}`);
      }
    });

    if (missing.length) {
      Api.badRequest(res, missing, message);
      return;
    } else {
      next();
    }
  },
  created(res: any, data: any, message: string) {
    jsonResponse(res, data, message, {
      status: Status.OK,
    });
  },
  maintenanceMode(res: any) {
    jsonResponse(
      res,
      { message: statusMessage(Status.MAINTENANCE_MODE) },
      Message.MaintenanceMode,
      { status: Status.MAINTENANCE_MODE }
    );
  },

  requireHeaders(request: any, res: any, headers: any, next: any) {
    const missing = [] as any;

    headers = Array.isArray(headers) ? headers : [headers];

    headers.forEach((header: any) => {
      if (!(request.headers && _hasOwnProperty.call(request.headers, header))) {
        missing.push(`Missing required header parameter: ${header}`);
      }
    });

    if (missing.length) {
      Api.badRequest(res, missing, "Missing Headers"); // Fixed this line
      return;
    } else {
      next();
    }
  },
};

export default Api;
