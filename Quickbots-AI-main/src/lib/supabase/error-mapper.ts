import type { PostgrestError } from "@supabase/supabase-js";

export function supabaseErrorToMessage(err: PostgrestError): string {
  if (!err || !err.code) return "Unexpected error occurred.";

  switch (err.code) {
    /* ----------------------------- DATA CONFLICTS ----------------------------- */
    case "23505": // unique_violation
      return "That value already exists. Please choose something different.";

    case "23503": // foreign_key_violation
      return "This action is not allowed because it depends on another resource.";

    case "23502": // not_null_violation
      return "A required field is missing.";

    case "54000": // program_limit_exceeded
      return "The request is too large. Try simplifying the data.";

    /* --------------------------- PERMISSION / RLS ----------------------------- */
    case "42501": // insufficient_privilege
      return "You don't have permission to perform this operation.";

    case "PGRST116": // RLS denied
      return "Access denied. You do not have access to this bot.";

    case "PGRST114": // update denied
      return "You cannot update this resource.";

    case "PGRST113": // insert denied
      return "You cannot create this resource.";

    case "PGRST115": // delete denied
      return "You cannot delete this resource.";

    /* ------------------------------ BAD REQUEST ------------------------------ */
    case "22P02": // invalid_text_representation (uuid parse errors, etc.)
      return "The provided value is invalid.";

    case "22001": // string_data_right_truncation
      return "Input is too long. Please shorten the text.";

    case "22003": // numeric_value_out_of_range
      return "A number is too large or outside the allowed range.";

    case "42883": // undefined_function
      return "Your request used an invalid or unsupported operation.";

    /* ------------------------------- TIMEOUTS -------------------------------- */
    case "57014": // query_canceled
      return "The request took too long. Please try again.";

    case "55P03": // lock_not_available
      return "The system is busy. Try again shortly.";

    /* ----------------------------- INTERNAL ERRORS --------------------------- */
    case "57P01": // admin_shutdown
    case "57P02": // crash_shutdown
      return "The service is temporarily unavailable. Please try again soon.";

    case "XX000": // internal_error
      return "An unexpected server error occurred.";

    /* -------------------------- PostgREST-specific --------------------------- */
    case "PGRST302": // malformed request
      return "Invalid request. Please check the inputs.";

    case "PGRST301":
      return "This endpoint does not exist.";

    /* ------------------------------- DEFAULT -------------------------------- */
    default:
      console.error("Unhandled Supabase Error:", err);
      return "Something went wrong. Please try again.";
  }
}

