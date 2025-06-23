import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glxjjckypmcxtkwysepe.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdseGpqY2t5cG1jeHRrd3lzZXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTg5MTAsImV4cCI6MjA2NjIzNDkxMH0.KbVhzVZ6cSJT24Czyu0KS155CYPRifZeVOqJ26pvZiM'

export const supabase = createClient(supabaseUrl, supabaseKey)