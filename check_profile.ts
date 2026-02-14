
const { data, error } = await supabase.from('profiles').select('*').limit(1)
console.log(data, error)
