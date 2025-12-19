import { ZodSchema, z } from "zod";

interface ZodValidationProps {
  schema: ZodSchema<any>;
  action: string;
  data: any;
}

interface ZodValidation_Output_Type{
  status:"Failed" | "Success",
  action?: string,
  message: string,
  errors?: any,
  data? : any,
}
export function SimpleZodValidation({ schema, data, action }: ZodValidationProps): ZodValidation_Output_Type {
  const validation = schema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.errors.map((error) => ({
      ...error,
      path: error.path,
    }));
    return {
      status:"Failed",
      action,
      message: `Validation failed`,
      errors,
    }
  } else {
    return {
      status: "Success",
      data: validation.data,
      message: "",
    };
  }
}
