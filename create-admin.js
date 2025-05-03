import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-supabase-key';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // User email to make admin
  const userEmail = 'pashaalmadani@gmail.com';
  
  try {
    // First, find the user ID by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }
    
    if (!userData) {
      console.error('User not found with email:', userEmail);
      return;
    }
    
    const userId = userData.id;
    
    // Check if user already has a role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (!roleCheckError && existingRole) {
      // Update existing role to admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating role:', updateError.message);
        return;
      }
      
      console.log(`Updated user ${userEmail} to admin role`);
    } else {
      // Insert new admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ id: userId, role: 'admin' });
      
      if (insertError) {
        console.error('Error inserting role:', insertError.message);
        return;
      }
      
      console.log(`Added admin role to user ${userEmail}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

main(); 