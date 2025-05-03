require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(`
ERROR: Missing Supabase credentials.
    
Please create a .env file in the root directory with the following variables:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key (preferred) or SUPABASE_ANON_KEY=your_supabase_anon_key
  `);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlFilePath = path.join(__dirname, 'setup-materials-table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL commands by semicolon followed by a newline
const sqlCommands = sqlContent
  .replace(/--.*$/gm, '') // Remove SQL comments
  .split(/;\s*\n/); // Split by semicolon followed by a newline

// Execute each SQL command sequentially
async function setupDatabase() {
  console.log('Starting database setup...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sqlCommands.length; i++) {
    const command = sqlCommands[i].trim();
    if (!command) continue; // Skip empty commands
    
    try {
      console.log(`Executing command ${i + 1}/${sqlCommands.length}...`);
      const { error } = await supabase.rpc('exec_sql', { query: command + ';' });
      
      if (error) {
        console.error(`Error executing command ${i + 1}:`, error.message);
        errorCount++;
      } else {
        console.log(`Command ${i + 1} executed successfully.`);
        successCount++;
      }
    } catch (error) {
      console.error(`Error executing command ${i + 1}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\nDatabase setup completed.');
  console.log(`${successCount} commands executed successfully.`);
  console.log(`${errorCount} commands failed.`);
  
  // Check if the necessary stored procedure exists
  if (errorCount > 0) {
    console.log(`
Note: If you're seeing errors about the 'exec_sql' function not existing, you need to create it first.
      
Connect to your Supabase instance and run the following SQL:

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql;
    `);
  }
  
  // Test database connection and check material_categories table
  try {
    const { data, error } = await supabase
      .from('material_categories')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Error checking material_categories table:', error.message);
    } else {
      console.log(`material_categories table contains ${data.length} categories.`);
    }
  } catch (error) {
    console.error('Error checking material_categories table:', error.message);
  }
}

// Run the setup
setupDatabase()
  .catch(error => {
    console.error('Unhandled error during setup:', error);
    process.exit(1);
  });