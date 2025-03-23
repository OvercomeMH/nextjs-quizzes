/**
 * Supabase Tools Script
 * 
 * This script uses official Supabase tools to manage database schema,
 * generate types, and keep documentation up to date.
 * 
 * Usage:
 *   node scripts/supabase-tools.js [command]
 * 
 * Available commands:
 *   types - Generate TypeScript types from Supabase schema
 *   docs - Generate API documentation markdown
 *   setup - Install Supabase CLI and set up project
 */

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined in .env.local');
  process.exit(1);
}

// Extract project reference from URL
// Example URL: https://abcdefghijkl.supabase.co
const getProjectRef = (url) => {
  const match = url.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
  return match ? match[1] : null;
};

const projectRef = getProjectRef(supabaseUrl);
if (!projectRef) {
  console.error('Error: Could not extract project reference from Supabase URL.');
  console.error('Expected format: https://<project-ref>.supabase.co');
  process.exit(1);
}

// Create docs directory if it doesn't exist
const docsDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Function to check if Supabase CLI is installed
function checkSupabaseCli() {
  try {
    const version = execSync('supabase --version', { stdio: 'pipe' }).toString().trim();
    console.log(`Supabase CLI ${version} is installed.`);
    return true;
  } catch (error) {
    console.log('Supabase CLI is not installed.');
    return false;
  }
}

// Function to install Supabase CLI
function installSupabaseCli() {
  console.log('Installing Supabase CLI...');
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' });
    console.log('Supabase CLI installed successfully.');
    return true;
  } catch (error) {
    console.error('Failed to install Supabase CLI:', error.message);
    console.log('\nOn Windows, npm global installs can be problematic. Please try one of these alternatives:');
    console.log('\n1. Install with Scoop (recommended):');
    console.log('   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser');
    console.log('   irm get.scoop.sh | iex');
    console.log('   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git');
    console.log('   scoop install supabase');
    
    console.log('\n2. Install with Chocolatey:');
    console.log('   choco install supabase');
    
    console.log('\nSee docs/SUPABASE-CLI-WINDOWS.md for detailed instructions.');
    return false;
  }
}

// Function to set up Supabase project
function setupSupabaseProject() {
  console.log(`Setting up Supabase project with reference: ${projectRef}`);
  try {
    // Check if user is logged in
    try {
      execSync('supabase projects list', { stdio: 'pipe' });
      console.log('Already logged in to Supabase CLI.');
    } catch (error) {
      console.log('Please login to Supabase CLI...');
      execSync('supabase login', { stdio: 'inherit' });
    }

    // Link project
    console.log(`Linking to Supabase project: ${projectRef}`);
    try {
      execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });
    } catch (error) {
      // Project might already be linked
      console.log('Project linking failed. If this is your first time running this command, you may need to initialize the project first.');
      console.log('Initializing Supabase project configuration...');
      execSync('supabase init', { stdio: 'inherit' });
      execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });
    }
    
    console.log('Supabase project setup completed successfully.');
    return true;
  } catch (error) {
    console.error('Failed to set up Supabase project:', error.message);
    console.log('You may need to manually run these commands:');
    console.log('  supabase login');
    console.log(`  supabase link --project-ref ${projectRef}`);
    return false;
  }
}

// Function to generate TypeScript types
function generateTypes() {
  console.log('Generating TypeScript types from Supabase schema...');
  try {
    // Create lib directory if it doesn't exist
    const libDir = path.join(process.cwd(), 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir);
    }

    // Try using supabase CLI first (preferred method)
    if (checkSupabaseCli()) {
      console.log('Using Supabase CLI to generate types...');
      try {
        execSync(`supabase gen types typescript --project-ref ${projectRef} --schema public > lib/database.types.ts`, { stdio: 'inherit' });
        console.log('TypeScript types generated successfully using Supabase CLI.');
        return true;
      } catch (error) {
        console.warn('Failed to generate types using Supabase CLI. Falling back to npx method...');
      }
    }

    // Fallback to npx if CLI is not installed or failed
    console.log('Using npx to generate types...');
    try {
      execSync(`npx supabase gen types typescript --project-id ${projectRef} --schema public > lib/database.types.ts`, { stdio: 'inherit' });
      console.log('TypeScript types generated successfully using npx.');
      return true;
    } catch (error) {
      console.error('Failed to generate types using npx:', error.message);
      console.log('\nAlternative: You can manually get your types from the Supabase Dashboard:');
      console.log('1. Go to https://app.supabase.com/project/_/api');
      console.log('2. Click on "TypeScript" in the left menu');
      console.log('3. Copy the generated types');
      console.log('4. Create a file lib/database.types.ts and paste the types');
      console.log('\nSee docs/SUPABASE-CLI-WINDOWS.md for more details.');
      return false;
    }
  } catch (error) {
    console.error('Failed to generate TypeScript types:', error.message);
    return false;
  }
}

// Function to generate API documentation
function generateApiDocs() {
  console.log('Generating API documentation...');
  try {
    // Create lib directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
    }
    
    let markdown = `# Supabase API Documentation\n\n`;
    markdown += `> Auto-generated documentation for ${supabaseUrl}\n\n`;
    
    markdown += `## Using Supabase Client\n\n`;
    markdown += "```typescript\n";
    markdown += `import { createClient } from '@supabase/supabase-js'\n\n`;
    markdown += `const supabaseUrl = '${supabaseUrl}'\n`;
    markdown += `const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY\n`;
    markdown += `const supabase = createClient(supabaseUrl, supabaseKey)\n`;
    markdown += "```\n\n";
    
    markdown += `## Common Database Operations\n\n`;
    
    // Select operation
    markdown += `### Selecting Data\n\n`;
    markdown += "```typescript\n";
    markdown += `// Get all rows\n`;
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .select('*')\n\n`;
    
    markdown += `// Get specific columns\n`;
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .select('column1, column2, column3')\n\n`;
    
    markdown += `// Query with filters\n`;
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .select('*')\n`;
    markdown += `  .eq('column_name', 'value')\n`;
    markdown += "```\n\n";
    
    // Insert operation
    markdown += `### Inserting Data\n\n`;
    markdown += "```typescript\n";
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .insert([\n`;
    markdown += `    { column1: 'value1', column2: 'value2' },\n`;
    markdown += `  ])\n`;
    markdown += `  .select()\n`;
    markdown += "```\n\n";
    
    // Update operation
    markdown += `### Updating Data\n\n`;
    markdown += "```typescript\n";
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .update({ column1: 'new_value' })\n`;
    markdown += `  .eq('id', 'some_id')\n`;
    markdown += `  .select()\n`;
    markdown += "```\n\n";
    
    // Delete operation
    markdown += `### Deleting Data\n\n`;
    markdown += "```typescript\n";
    markdown += `const { error } = await supabase\n`;
    markdown += `  .from('table_name')\n`;
    markdown += `  .delete()\n`;
    markdown += `  .eq('id', 'some_id')\n`;
    markdown += "```\n\n";
    
    // Join tables
    markdown += `### Joining Tables\n\n`;
    markdown += "```typescript\n";
    markdown += `const { data, error } = await supabase\n`;
    markdown += `  .from('table1')\n`;
    markdown += `  .select(\`\n`;
    markdown += `    *,\n`;
    markdown += `    table2 (*)\n`;
    markdown += `  \`)\n`;
    markdown += `  .eq('table1.id', 'some_id')\n`;
    markdown += "```\n\n";
    
    // Additional resources
    markdown += `## Additional Resources\n\n`;
    markdown += `- [Official Supabase Documentation](https://supabase.com/docs)\n`;
    markdown += `- [API Reference for JavaScript](https://supabase.com/docs/reference/javascript/introduction)\n`;
    markdown += `- [Supabase Dashboard](${supabaseUrl})\n`;
    markdown += `\n`;
    markdown += `For complete API reference, visit the [Supabase API Docs](${supabaseUrl}/project/api) in your project dashboard.\n`;
    
    fs.writeFileSync(
      path.join(docsDir, 'supabase-api.md'),
      markdown,
      'utf8'
    );
    
    console.log('API documentation generated successfully at docs/supabase-api.md');
    return true;
  } catch (error) {
    console.error('Failed to generate API documentation:', error.message);
    return false;
  }
}

// Function to show database diff
function showDatabaseDiff() {
  console.log('Checking database schema changes...');
  
  if (!checkSupabaseCli()) {
    console.error('Supabase CLI is required for this operation.');
    return false;
  }
  
  try {
    console.log('Running database diff...');
    execSync('supabase db diff', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Failed to run database diff:', error.message);
    return false;
  }
}

// Function to run local development
function startLocalDevelopment() {
  console.log('Starting local Supabase development environment...');
  
  if (!checkSupabaseCli()) {
    console.error('Supabase CLI is required for this operation.');
    return false;
  }
  
  try {
    console.log('Starting Supabase local development...');
    execSync('supabase start', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Failed to start local development:', error.message);
    console.log('You might need to initialize the project first with: supabase init');
    return false;
  }
}

// Main function
async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'setup':
      if (!checkSupabaseCli()) {
        installSupabaseCli();
      }
      setupSupabaseProject();
      break;
      
    case 'types':
      generateTypes();
      break;
      
    case 'docs':
      generateApiDocs();
      break;
      
    case 'diff':
      showDatabaseDiff();
      break;
      
    case 'start':
      startLocalDevelopment();
      break;
      
    case 'help':
    default:
      console.log(`
Supabase Tools - Official tooling for Supabase projects

Usage:
  node scripts/supabase-tools.js [command]

Available commands:
  setup     - Install Supabase CLI and link project
  types     - Generate TypeScript types from schema
  docs      - Generate API documentation
  diff      - Show database schema changes
  start     - Start local Supabase development
  help      - Show this help message

Examples:
  node scripts/supabase-tools.js setup
  node scripts/supabase-tools.js types
      `);
      break;
  }
}

// Run the main function
main(); 