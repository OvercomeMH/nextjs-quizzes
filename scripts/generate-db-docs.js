/**
 * Database Documentation Generator
 * 
 * This script generates documentation about the database schema by querying
 * the database directly and outputting documentation in markdown format.
 * 
 * Usage:
 *   node scripts/generate-db-docs.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define tables we're interested in
const TABLES = [
  'users',
  'quizzes',
  'questions',
  'question_possible_answers',
  'submissions',
  'user_answers'
];

// Function to get columns for a specific table
async function getTableColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      console.error(`Error getting columns for table ${tableName}:`, error.message);
      return null;
    }
    
    // If we got data, extract column names and types from the first row
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]).map(colName => {
        const value = data[0][colName];
        let type = typeof value;
        
        // Better type detection
        if (type === 'object') {
          if (value === null) type = 'unknown';
          else if (Array.isArray(value)) type = 'array';
          else if (value instanceof Date) type = 'datetime';
        } else if (type === 'string') {
          // Check if it looks like a date
          const datePattern = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/;
          if (datePattern.test(value)) type = 'datetime';
        }
        
        return { name: colName, type };
      });
      
      return columns;
    } else {
      console.warn(`Table ${tableName} exists but has no rows. Using type inference.`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching columns for ${tableName}:`, error);
    return null;
  }
}

// Generate markdown documentation
async function generateMarkdownDoc() {
  const timestamp = new Date().toISOString().split('T')[0];
  let markdown = `# QuizMaster Database Schema\n\n`;
  markdown += `> Auto-generated documentation created on ${timestamp}\n\n`;
  
  markdown += `## Tables Overview\n\n`;
  markdown += `This database contains the following tables:\n\n`;
  
  for (const table of TABLES) {
    markdown += `- [${table}](#${table})\n`;
  }
  
  // Add detail sections for each table
  for (const tableName of TABLES) {
    markdown += `\n## ${tableName}\n\n`;
    
    const columns = await getTableColumns(tableName);
    
    if (columns && columns.length > 0) {
      markdown += `| Column Name | Data Type | Description |\n`;
      markdown += `|-------------|-----------|-------------|\n`;
      
      for (const column of columns) {
        markdown += `| ${column.name} | ${column.type} | |\n`;
      }
    } else {
      markdown += `Unable to fetch column information for this table.\n`;
    }
    
    // Add placeholder for relationships
    markdown += `\n### Relationships\n\n`;
    
    if (tableName === 'users') {
      markdown += `- One user can have many submissions\n`;
    } else if (tableName === 'quizzes') {
      markdown += `- One quiz can have many questions\n`;
      markdown += `- One quiz can have many submissions\n`;
    } else if (tableName === 'questions') {
      markdown += `- Belongs to one quiz\n`;
      markdown += `- One question can have many possible answers\n`;
      markdown += `- One question can have many user answers\n`;
    } else if (tableName === 'question_possible_answers') {
      markdown += `- Belongs to one question\n`;
    } else if (tableName === 'submissions') {
      markdown += `- Belongs to one user\n`;
      markdown += `- Belongs to one quiz\n`;
      markdown += `- One submission can have many user answers\n`;
    } else if (tableName === 'user_answers') {
      markdown += `- Belongs to one submission\n`;
      markdown += `- References one question\n`;
    }
  }
  
  // Add note about limitations of auto-generation
  markdown += `\n## Notes\n\n`;
  markdown += `This documentation was generated automatically by querying the database structure. `;
  markdown += `Some information, such as detailed descriptions and business logic, needs to be added manually.\n\n`;
  markdown += `Please consider enhancing this documentation with:\n\n`;
  markdown += `- More detailed column descriptions\n`;
  markdown += `- Examples of typical queries\n`;
  markdown += `- Information about indexes and constraints\n`;
  markdown += `- Business rules and validations\n`;
  
  return markdown;
}

// Generate ERD diagram code
async function generateERDiagram() {
  let mermaid = `\`\`\`mermaid\nerDiagram\n`;
  
  // Add entity blocks
  for (const tableName of TABLES) {
    mermaid += `    ${tableName.toUpperCase()} {\n`;
    
    const columns = await getTableColumns(tableName);
    
    if (columns && columns.length > 0) {
      for (const column of columns) {
        // Try to determine if this is a primary key or foreign key
        let suffix = '';
        if (column.name === 'id') suffix = ' PK';
        else if (column.name.endsWith('_id')) suffix = ' FK';
        
        mermaid += `        ${column.type} ${column.name}${suffix}\n`;
      }
    }
    
    mermaid += `    }\n    \n`;
  }
  
  // Add relationships
  mermaid += `    QUIZZES ||--o{ QUESTIONS : "has"\n`;
  mermaid += `    QUESTIONS ||--o{ QUESTION_POSSIBLE_ANSWERS : "has"\n`;
  mermaid += `    USERS ||--o{ SUBMISSIONS : "makes"\n`;
  mermaid += `    QUIZZES ||--o{ SUBMISSIONS : "has"\n`;
  mermaid += `    SUBMISSIONS ||--o{ USER_ANSWERS : "contains"\n`;
  mermaid += `    QUESTIONS ||--o{ USER_ANSWERS : "referenced in"\n`;
  
  mermaid += `\`\`\`\n`;
  return mermaid;
}

// Main function
async function main() {
  console.log('Generating database documentation...');
  
  try {
    // Generate markdown documentation
    const markdown = await generateMarkdownDoc();
    
    // Generate ERD diagram
    const erdDiagram = await generateERDiagram();
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
    }
    
    // Write markdown file
    fs.writeFileSync(
      path.join(docsDir, 'db-schema.md'),
      markdown,
      'utf8'
    );
    
    // Write ERD diagram file
    fs.writeFileSync(
      path.join(docsDir, 'db-diagram.md'),
      `# Database Diagram\n\n${erdDiagram}\n\nView this file with a Markdown viewer that supports Mermaid diagrams.`,
      'utf8'
    );
    
    console.log('Documentation generated successfully!');
    console.log(`- Markdown docs: ${path.join(docsDir, 'db-schema.md')}`);
    console.log(`- ERD diagram: ${path.join(docsDir, 'db-diagram.md')}`);
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 