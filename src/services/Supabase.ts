import {
  createClient
} from "@supabase/supabase-js";


export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;


export const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


if (
  !supabaseUrl ||
  !supabasePublishableKey
) {

  throw new Error(
    "Faltan las variables de entorno de Supabase."
  );

}


export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey
  );