import getDatabase from './connection';

const createTables = async () => {
  const db = getDatabase();

  try {
    // Create workspaces table
    await db.run(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        label_format TEXT DEFAULT '{number}',
        label_padding INTEGER DEFAULT 1,
        label_separator TEXT DEFAULT '',
        label_next_number INTEGER DEFAULT 1,
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
        label_id TEXT,
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
    await db.run('CREATE INDEX IF NOT EXISTS idx_items_label_id ON items(label_id)');
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

const addLabelFields = async () => {
  const db = getDatabase();
  
  try {
    // Check if workspaces table exists first
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='workspaces'");
    if (tables.length === 0) {
      console.log('Workspaces table does not exist yet, skipping label fields migration...');
      return;
    }

    // Check if label fields exist in workspaces table
    const workspaceColumns = await db.all("PRAGMA table_info(workspaces)");
    const hasLabelFormat = workspaceColumns.some((col: any) => col.name === 'label_format');
    
    if (!hasLabelFormat) {
      console.log('Adding label configuration fields to workspaces table...');
      await db.run('ALTER TABLE workspaces ADD COLUMN label_format TEXT DEFAULT \'{number}\'');
      await db.run('ALTER TABLE workspaces ADD COLUMN label_padding INTEGER DEFAULT 1');
      await db.run('ALTER TABLE workspaces ADD COLUMN label_separator TEXT DEFAULT \'\'');
      await db.run('ALTER TABLE workspaces ADD COLUMN label_next_number INTEGER DEFAULT 1');
    }
    
    // Check if items table exists first
    const itemsTables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='items'");
    if (itemsTables.length === 0) {
      console.log('Items table does not exist yet, skipping label_id field migration...');
      return;
    }

    // Check if label_id field exists in items table
    const itemColumns = await db.all("PRAGMA table_info(items)");
    const hasLabelId = itemColumns.some((col: any) => col.name === 'label_id');
    
    if (!hasLabelId) {
      console.log('Adding label_id field to items table...');
      await db.run('ALTER TABLE items ADD COLUMN label_id TEXT');
      await db.run('CREATE INDEX IF NOT EXISTS idx_items_label_id ON items(label_id)');
    }
    
    console.log('Label fields migration completed successfully');
  } catch (error) {
    console.error('Error adding label fields:', error);
    throw error;
  }
};

const addExpirationField = async () => {
  const db = getDatabase();
  
  try {
    // Check if items table exists first
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='items'");
    if (tables.length === 0) {
      console.log('Items table does not exist yet, skipping expiration field migration...');
      return;
    }

    // Check if expiration_date field exists in items table
    const itemColumns = await db.all("PRAGMA table_info(items)");
    const hasExpirationDate = itemColumns.some((col: any) => col.name === 'expiration_date');
    
    if (!hasExpirationDate) {
      console.log('Adding expiration_date field to items table...');
      await db.run('ALTER TABLE items ADD COLUMN expiration_date DATE');
    }
    
    console.log('Expiration field migration completed successfully');
  } catch (error) {
    console.error('Error adding expiration field:', error);
    throw error;
  }
};

const addCurrencyField = async () => {
  const db = getDatabase();
  
  try {
    // Check if workspaces table exists first
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='workspaces'");
    if (tables.length === 0) {
      console.log('Workspaces table does not exist yet, skipping currency field migration...');
      return;
    }

    // Check if currency field exists in workspaces table
    const workspaceColumns = await db.all("PRAGMA table_info(workspaces)");
    const hasCurrency = workspaceColumns.some((col: any) => col.name === 'currency');
    
    if (!hasCurrency) {
      console.log('Adding currency field to workspaces table...');
      await db.run('ALTER TABLE workspaces ADD COLUMN currency TEXT DEFAULT \'USD\'');
    }
    
    console.log('Currency field migration completed successfully');
  } catch (error) {
    console.error('Error adding currency field:', error);
    throw error;
  }
};

export { createTables, addLabelFields, addExpirationField, addCurrencyField };

// Auto-run migrations
const migrate = async () => {
  try {
    await createTables();
    // Run label fields migration after tables are created
    await addLabelFields();
    // Run expiration field migration
    await addExpirationField();
    // Run currency field migration
    await addCurrencyField();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export default migrate; 