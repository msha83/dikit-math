// Function to make a user admin
async function makeUserAdmin(email = 'pashaalmadani@gmail.com') {
  try {
    console.log(`Attempting to make ${email} an admin...`);
    
    // Get current user's ID from profiles table
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError.message);
      return false;
    }
    
    if (!userData) {
      console.error('User not found with email:', email);
      return false;
    }
    
    const userId = userData.id;
    console.log(`User found with ID: ${userId}`);
    
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
        return false;
      }
      
      console.log(`Updated user ${email} to admin role`);
      return true;
    } else {
      // Insert new admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ id: userId, role: 'admin' });
      
      if (insertError) {
        console.error('Error inserting role:', insertError.message);
        return false;
      }
      
      console.log(`Added admin role to user ${email}`);
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

// Execute the function
makeUserAdmin().then(success => {
  if (success) {
    console.log('✅ Admin role successfully assigned!');
    console.log('You can now access admin features at /admin');
  } else {
    console.log('❌ Failed to assign admin role');
  }
}); 