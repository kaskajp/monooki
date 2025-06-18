import getDatabase from './connection';

const createTables = async () => {
  const db = getDatabase();

  try {
    // Create workspaces table
    await db.run(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
      )
    `);

    // Create categories table
    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        UNIQUE(name, workspace_id)
      )
    `);

    // Create locations table
    await db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        UNIQUE(name, workspace_id)
      )
    `);

    // Create items table
    await db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        location_id TEXT,
        category_id TEXT,
        quantity INTEGER DEFAULT 1,
        model_number TEXT,
        serial_number TEXT,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        purchase_location TEXT,
        warranty TEXT,
        custom_fields TEXT, -- JSON string
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Create photos table
    await db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        item_id TEXT,
        location_id TEXT,
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
        CHECK ((item_id IS NOT NULL AND location_id IS NULL) OR (item_id IS NULL AND location_id IS NOT NULL))
      )
    `);

    // Create attachments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);

    // Create custom_fields table
    await db.run(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        field_type TEXT CHECK(field_type IN ('text', 'number', 'date', 'textarea', 'checkbox', 'enum')) NOT NULL DEFAULT 'text',
        required BOOLEAN NOT NULL DEFAULT 0,
        options TEXT, -- JSON array for enum options
        workspace_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        UNIQUE(name, workspace_id)
      )
    `);

    // Create indexes for better performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_items_workspace ON items(workspace_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_categories_workspace ON categories(workspace_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_locations_workspace ON locations(workspace_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_photos_location ON photos(location_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_attachments_item ON attachments(item_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_custom_fields_workspace ON custom_fields(workspace_id)');

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default createTables; 