/**
 * Supabase ist aktiv, sobald URL und öffentlicher (publishable/anon) Schlüssel gesetzt sind.
 * Ohne diese Werte läuft die App im Demo-Modus mit synthetischen Testdaten.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseAktiv = supabaseUrl.length > 0 && supabaseKey.length > 0;
